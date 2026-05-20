export declare const MOCK_USER: {
    id: string;
    email: string;
    risk_score: number;
    monthly_budget: number;
    horizon: string;
    excluded_sectors: never[];
    email_alerts: boolean;
    event_count: number;
};
export declare const MOCK_PRICES: Record<string, any>;
export declare const MOCK_SENTIMENT: {
    fear_greed: number;
    fear_greed_label: string;
    treasury_10y: number;
    top_headlines: string[];
    updated_at: string;
};
export declare const MOCK_RECOMMENDATIONS: Record<string, any>;
export declare const MOCK_HISTORY: {
    id: number;
    risk_score_used: number;
    created_at: string;
    market_snapshot: {
        fear_greed: number;
        fear_greed_label: string;
        treasury_10y: number;
    };
    payload: {
        recommendations: {
            ticker: string;
            name: string;
            allocation_pct: number;
            price_at_rec: number;
            change_1d_pct: number;
            asset_class: string;
            sector: string;
            rationale: string;
            key_risk: string;
        }[];
        market_summary: string;
        disclaimer: string;
    };
}[];
export declare const MOCK_ALERTS: {
    id: number;
    condition_name: string;
    severity: string;
    message: string;
    created_at: string;
    read_by: string[];
}[];
