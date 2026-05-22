import { SupabaseService } from '../supabase/supabase.service';
import { MarketDataFetcherService } from '../market/market-data-fetcher.service';
import { BanditService } from '../bandit/bandit.service';
export declare class RecommendationsService {
    private supabase;
    private marketFetcher;
    private bandit;
    private readonly logger;
    private anthropic;
    constructor(supabase: SupabaseService, marketFetcher: MarketDataFetcherService, bandit: BanditService);
    generate(user: any, riskOverride?: number, excludedTickers?: string[]): Promise<any>;
    private generateWithClaude;
    private buildCandidates;
}
