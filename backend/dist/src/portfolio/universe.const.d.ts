export interface AssetMeta {
    name: string;
    asset_class: 'etf' | 'bond' | 'stock' | 'commodity' | 'reit' | 'crypto' | 'cash';
    sector: string;
    risk_level: number;
    min_budget: number;
}
export declare const UNIVERSE: Record<string, AssetMeta>;
