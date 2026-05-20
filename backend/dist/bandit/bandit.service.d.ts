import { SupabaseService } from '../supabase/supabase.service';
export declare class BanditService {
    private supabase;
    private readonly log;
    private readonly C;
    private readonly REWARDS;
    constructor(supabase: SupabaseService);
    getScores(userId: string): Promise<Record<string, number>>;
    getBanditProfile(userId: string): Promise<{
        top_liked: Array<{
            ticker: string;
            net_reward: number;
            feedback_count: number;
        }>;
        top_disliked: Array<{
            ticker: string;
            net_reward: number;
            feedback_count: number;
        }>;
        total_feedback_events: number;
        total_tickers_seen: number;
        personalization_pct: number;
        positive_rate: number;
    }>;
    rank(tickers: string[], ucbScores: Record<string, number>): string[];
}
