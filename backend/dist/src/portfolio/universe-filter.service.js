"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniverseFilterService = void 0;
const common_1 = require("@nestjs/common");
const universe_const_1 = require("./universe.const");
let UniverseFilterService = class UniverseFilterService {
    filter(user) {
        return Object.entries(universe_const_1.UNIVERSE)
            .filter(([ticker, asset]) => {
            if (Math.abs(asset.risk_level - (user.risk_score ?? 7)) > 3)
                return false;
            if (ticker === 'BRK-B' && (user.monthly_budget ?? 0) < 200)
                return false;
            if (user.excluded_sectors?.includes(asset.sector))
                return false;
            if (user.avoided_tickers?.includes(ticker))
                return false;
            return true;
        })
            .map(([ticker]) => ticker);
    }
};
exports.UniverseFilterService = UniverseFilterService;
exports.UniverseFilterService = UniverseFilterService = __decorate([
    (0, common_1.Injectable)()
], UniverseFilterService);
//# sourceMappingURL=universe-filter.service.js.map