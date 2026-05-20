"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskEngineService = void 0;
const common_1 = require("@nestjs/common");
const mock_data_1 = require("../mock/mock-data");
let RiskEngineService = class RiskEngineService {
    scoreAssets(pricesMap, sentiment) {
        const prices = pricesMap ?? mock_data_1.MOCK_PRICES;
        const { fear_greed, treasury_10y } = sentiment ?? mock_data_1.MOCK_SENTIMENT;
        const scores = {};
        for (const [ticker, asset] of Object.entries(prices)) {
            const momentum = Math.min(10, Math.max(0, 5 + (asset.change_1d_pct ?? 0) * 2));
            const volatility = 10 - (asset.risk_level ?? 5);
            let macro_adj = 0;
            if (fear_greed < 30) {
                if (['bond', 'cash'].includes(asset.asset_class))
                    macro_adj += 2;
                if (asset.asset_class === 'crypto')
                    macro_adj -= 2;
            }
            else if (fear_greed > 70) {
                if (asset.asset_class === 'crypto' || asset.sector === 'technology')
                    macro_adj += 1.5;
                if (asset.asset_class === 'bond')
                    macro_adj -= 1;
            }
            if (treasury_10y > 4.5) {
                if (asset.asset_class === 'bond')
                    macro_adj -= 1;
                if (asset.sector === 'dividend')
                    macro_adj += 1;
            }
            scores[ticker] = volatility * 0.2 + momentum * 0.4 + (5 + macro_adj) * 0.4;
        }
        return scores;
    }
};
exports.RiskEngineService = RiskEngineService;
exports.RiskEngineService = RiskEngineService = __decorate([
    (0, common_1.Injectable)()
], RiskEngineService);
//# sourceMappingURL=risk-engine.service.js.map