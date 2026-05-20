"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const risk_engine_service_1 = require("./risk-engine.service");
const universe_filter_service_1 = require("./universe-filter.service");
const universe_const_1 = require("./universe.const");
const mock_data_1 = require("../mock/mock-data");
const ALLOCATION_RULES = {
    conservative: { bond: 0.55, cash: 0.10, etf: 0.25, reit: 0.05, commodity: 0.05, stock: 0, crypto: 0 },
    balanced: { etf: 0.40, bond: 0.25, stock: 0.15, reit: 0.10, commodity: 0.05, cash: 0.05, crypto: 0 },
    growth: { etf: 0.35, stock: 0.25, crypto: 0.15, bond: 0.10, reit: 0.10, commodity: 0.05, cash: 0 },
    aggressive: { stock: 0.30, crypto: 0.30, etf: 0.25, commodity: 0.10, reit: 0.05, bond: 0, cash: 0 },
};
let PortfolioService = class PortfolioService {
    riskEngine;
    universeFilter;
    constructor(riskEngine, universeFilter) {
        this.riskEngine = riskEngine;
        this.universeFilter = universeFilter;
    }
    buildPortfolio(user, pricesMap, sentiment) {
        const band = this.getBand(user.risk_score ?? 7);
        const rules = ALLOCATION_RULES[band];
        const prices = pricesMap ?? mock_data_1.MOCK_PRICES;
        const eligible = this.universeFilter.filter(user);
        const scores = this.riskEngine.scoreAssets(prices, sentiment);
        const byClass = {};
        for (const ticker of eligible) {
            const asset = universe_const_1.UNIVERSE[ticker];
            if (!asset)
                continue;
            if (!byClass[asset.asset_class])
                byClass[asset.asset_class] = [];
            byClass[asset.asset_class].push(ticker);
        }
        const result = [];
        for (const [assetClass, weight] of Object.entries(rules)) {
            if (weight === 0)
                continue;
            const tickers = (byClass[assetClass] ?? [])
                .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
                .slice(0, 2);
            if (tickers.length === 0)
                continue;
            const perTicker = (weight / tickers.length) * 100;
            for (const ticker of tickers) {
                const asset = universe_const_1.UNIVERSE[ticker];
                const price = prices[ticker] ?? mock_data_1.MOCK_PRICES[ticker];
                result.push({
                    ticker,
                    name: asset.name,
                    asset_class: asset.asset_class,
                    sector: asset.sector,
                    allocation_pct: Math.round(perTicker * 100) / 100,
                    current_price: price?.price ?? null,
                    change_1d_pct: price?.change_1d_pct ?? null,
                    rationale: `Selected based on ${band} risk profile and current market conditions.`,
                    key_risk: `As a ${asset.asset_class} holding, this carries ${asset.sector} sector risk.`,
                });
            }
        }
        const total = result.reduce((sum, r) => sum + r.allocation_pct, 0);
        if (total > 0 && result.length > 0) {
            const factor = 100 / total;
            result.forEach(r => { r.allocation_pct = Math.round(r.allocation_pct * factor * 100) / 100; });
        }
        return result.sort((a, b) => b.allocation_pct - a.allocation_pct);
    }
    getBand(score) {
        if (score <= 3)
            return 'conservative';
        if (score <= 6)
            return 'balanced';
        if (score <= 8)
            return 'growth';
        return 'aggressive';
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [risk_engine_service_1.RiskEngineService,
        universe_filter_service_1.UniverseFilterService])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map