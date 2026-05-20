import { MarketService } from './market.service';
export declare class MarketController {
    private readonly marketService;
    constructor(marketService: MarketService);
    getPrices(): Promise<any>;
    getSentiment(): Promise<any>;
}
