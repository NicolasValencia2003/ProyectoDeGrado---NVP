import { SupabaseService } from '../supabase/supabase.service';
export declare class BanditService {
    private supabase;
    private readonly log;
    private readonly C;
    private readonly REWARDS;
    constructor(supabase: SupabaseService);
    getScores(userId: string): Promise<Record<string, number>>;
    rank(tickers: string[], ucbScores: Record<string, number>): string[];
}
