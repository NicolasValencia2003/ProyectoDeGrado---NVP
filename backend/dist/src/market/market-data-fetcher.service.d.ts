import { SupabaseService } from '../supabase/supabase.service';
export declare class MarketDataFetcherService {
    private supabase;
    private readonly log;
    private memPrices;
    private memPricesAt;
    constructor(supabase: SupabaseService);
    getPricesWithRefresh(): Promise<Record<string, any>>;
    private fetchStockPrices;
    private fetchStockPricesTwelveData;
    private fetchStockPricesYahoo;
    private fetchCryptoPrices;
    private savePricesToSupabase;
    getSentimentWithRefresh(): Promise<any>;
    private fetchSentiment;
    private fetchFearGreed;
    private fetchTreasury10Y;
    private fetchHeadlines;
    private saveSentimentToSupabase;
    private buildFallbackPrices;
    private isStale;
}
