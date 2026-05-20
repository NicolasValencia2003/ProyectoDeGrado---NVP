import { MarketDataFetcherService } from './market-data-fetcher.service';
export declare class MarketService {
    private fetcher;
    constructor(fetcher: MarketDataFetcherService);
    getPrices(): Promise<any>;
    getSentiment(): Promise<any>;
}
