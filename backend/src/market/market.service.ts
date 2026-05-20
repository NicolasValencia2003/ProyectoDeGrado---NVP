import { Injectable } from '@nestjs/common';
import { MarketDataFetcherService } from './market-data-fetcher.service';

@Injectable()
export class MarketService {
  constructor(private fetcher: MarketDataFetcherService) {}

  getPrices(): Promise<any> {
    return this.fetcher.getPricesWithRefresh();
  }

  getSentiment(): Promise<any> {
    return this.fetcher.getSentimentWithRefresh();
  }
}
