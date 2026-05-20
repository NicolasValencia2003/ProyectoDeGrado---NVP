import { BanditService } from './bandit.service';
export declare class BanditController {
    private bandit;
    constructor(bandit: BanditService);
    getProfile(user: any): Promise<{
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
}
