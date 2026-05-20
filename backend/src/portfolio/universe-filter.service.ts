import { Injectable } from '@nestjs/common';
import { UNIVERSE } from './universe.const';

@Injectable()
export class UniverseFilterService {
  filter(user: any): string[] {
    return Object.entries(UNIVERSE)
      .filter(([ticker, asset]) => {
        if (Math.abs(asset.risk_level - (user.risk_score ?? 7)) > 3) return false;
        if (ticker === 'BRK-B' && (user.monthly_budget ?? 0) < 200) return false;
        if (user.excluded_sectors?.includes(asset.sector)) return false;
        if (user.avoided_tickers?.includes(ticker)) return false;
        return true;
      })
      .map(([ticker]) => ticker);
  }
}
