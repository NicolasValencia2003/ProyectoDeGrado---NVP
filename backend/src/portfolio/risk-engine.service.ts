import { Injectable } from '@nestjs/common';
import { MOCK_PRICES, MOCK_SENTIMENT } from '../mock/mock-data';

@Injectable()
export class RiskEngineService {
  scoreAssets(pricesMap?: Record<string, any>, sentiment?: any): Record<string, number> {
    const prices = pricesMap ?? MOCK_PRICES;
    const { fear_greed, treasury_10y } = sentiment ?? MOCK_SENTIMENT;
    const scores: Record<string, number> = {};

    for (const [ticker, asset] of Object.entries(prices)) {
      const momentum  = Math.min(10, Math.max(0, 5 + (asset.change_1d_pct ?? 0) * 2));
      const volatility = 10 - (asset.risk_level ?? 5);

      let macro_adj = 0;
      if (fear_greed < 30) {
        if (['bond', 'cash'].includes(asset.asset_class)) macro_adj += 2;
        if (asset.asset_class === 'crypto') macro_adj -= 2;
      } else if (fear_greed > 70) {
        if (asset.asset_class === 'crypto' || asset.sector === 'technology') macro_adj += 1.5;
        if (asset.asset_class === 'bond') macro_adj -= 1;
      }
      if (treasury_10y > 4.5) {
        if (asset.asset_class === 'bond') macro_adj -= 1;
        if (asset.sector === 'dividend')  macro_adj += 1;
      }

      scores[ticker] = volatility * 0.2 + momentum * 0.4 + (5 + macro_adj) * 0.4;
    }

    return scores;
  }
}
