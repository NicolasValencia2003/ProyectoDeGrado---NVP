import { Injectable } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';
import { UniverseFilterService } from './universe-filter.service';
import { UNIVERSE } from './universe.const';
import { MOCK_PRICES } from '../mock/mock-data';

const ALLOCATION_RULES: Record<string, Record<string, number>> = {
  conservative: { bond: 0.55, cash: 0.10, etf: 0.25, reit: 0.05, commodity: 0.05, stock: 0, crypto: 0 },
  balanced:     { etf: 0.40, bond: 0.25, stock: 0.15, reit: 0.10, commodity: 0.05, cash: 0.05, crypto: 0 },
  growth:       { etf: 0.35, stock: 0.25, crypto: 0.15, bond: 0.10, reit: 0.10, commodity: 0.05, cash: 0 },
  aggressive:   { stock: 0.30, crypto: 0.30, etf: 0.25, commodity: 0.10, reit: 0.05, bond: 0, cash: 0 },
};

@Injectable()
export class PortfolioService {
  constructor(
    private riskEngine: RiskEngineService,
    private universeFilter: UniverseFilterService,
  ) {}

  buildPortfolio(user: any, pricesMap?: Record<string, any>, sentiment?: any): any[] {
    const band    = this.getBand(user.risk_score ?? 7);
    const rules   = ALLOCATION_RULES[band];
    const prices  = pricesMap ?? MOCK_PRICES;
    const eligible = this.universeFilter.filter(user);
    const scores  = this.riskEngine.scoreAssets(prices, sentiment);

    const byClass: Record<string, string[]> = {};
    for (const ticker of eligible) {
      const asset = UNIVERSE[ticker];
      if (!asset) continue;
      if (!byClass[asset.asset_class]) byClass[asset.asset_class] = [];
      byClass[asset.asset_class].push(ticker);
    }

    const result: any[] = [];
    for (const [assetClass, weight] of Object.entries(rules)) {
      if (weight === 0) continue;
      const tickers = (byClass[assetClass] ?? [])
        .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
        .slice(0, 2);
      if (tickers.length === 0) continue;
      const perTicker = (weight / tickers.length) * 100;
      for (const ticker of tickers) {
        const asset = UNIVERSE[ticker];
        const price = prices[ticker] ?? MOCK_PRICES[ticker];
        result.push({
          ticker,
          name:           asset.name,
          asset_class:    asset.asset_class,
          sector:         asset.sector,
          allocation_pct: Math.round(perTicker * 100) / 100,
          current_price:  price?.price ?? null,
          change_1d_pct:  price?.change_1d_pct ?? null,
          rationale: `Selected based on ${band} risk profile and current market conditions.`,
          key_risk:  `As a ${asset.asset_class} holding, this carries ${asset.sector} sector risk.`,
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

  private getBand(score: number): string {
    if (score <= 3) return 'conservative';
    if (score <= 6) return 'balanced';
    if (score <= 8) return 'growth';
    return 'aggressive';
  }
}
