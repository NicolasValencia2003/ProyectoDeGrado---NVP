export interface AssetMeta {
  name: string;
  asset_class: 'etf' | 'bond' | 'stock' | 'commodity' | 'reit' | 'crypto' | 'cash';
  sector: string;
  risk_level: number;
  min_budget: number;
}

export const UNIVERSE: Record<string, AssetMeta> = {
  SPY:       { name: 'S&P 500 ETF',        asset_class: 'etf',       sector: 'broad_market',  risk_level: 5,  min_budget: 1   },
  QQQ:       { name: 'Nasdaq 100 ETF',      asset_class: 'etf',       sector: 'technology',    risk_level: 7,  min_budget: 1   },
  VTI:       { name: 'Total US Market ETF', asset_class: 'etf',       sector: 'broad_market',  risk_level: 5,  min_budget: 1   },
  VXUS:      { name: 'International ETF',   asset_class: 'etf',       sector: 'international', risk_level: 6,  min_budget: 1   },
  BND:       { name: 'Total Bond Market',   asset_class: 'bond',      sector: 'bonds',         risk_level: 2,  min_budget: 1   },
  TLT:       { name: 'Long-term Treasury',  asset_class: 'bond',      sector: 'bonds',         risk_level: 3,  min_budget: 1   },
  HYG:       { name: 'High Yield Bonds',    asset_class: 'bond',      sector: 'bonds',         risk_level: 5,  min_budget: 1   },
  TIPS:      { name: 'Inflation Protected', asset_class: 'bond',      sector: 'bonds',         risk_level: 2,  min_budget: 1   },
  XLK:       { name: 'Technology Sector',   asset_class: 'etf',       sector: 'technology',    risk_level: 7,  min_budget: 1   },
  XLV:       { name: 'Healthcare Sector',   asset_class: 'etf',       sector: 'healthcare',    risk_level: 5,  min_budget: 1   },
  XLE:       { name: 'Energy Sector',       asset_class: 'etf',       sector: 'energy',        risk_level: 7,  min_budget: 1   },
  XLF:       { name: 'Financials Sector',   asset_class: 'etf',       sector: 'financials',    risk_level: 6,  min_budget: 1   },
  XLP:       { name: 'Consumer Staples',    asset_class: 'etf',       sector: 'staples',       risk_level: 3,  min_budget: 1   },
  XLU:       { name: 'Utilities Sector',    asset_class: 'etf',       sector: 'utilities',     risk_level: 3,  min_budget: 1   },
  GLD:       { name: 'Gold ETF',            asset_class: 'commodity', sector: 'commodities',   risk_level: 4,  min_budget: 1   },
  SLV:       { name: 'Silver ETF',          asset_class: 'commodity', sector: 'commodities',   risk_level: 6,  min_budget: 1   },
  VNQ:       { name: 'Real Estate REIT',    asset_class: 'reit',      sector: 'real_estate',   risk_level: 5,  min_budget: 1   },
  AAPL:      { name: 'Apple Inc.',          asset_class: 'stock',     sector: 'technology',    risk_level: 6,  min_budget: 1   },
  MSFT:      { name: 'Microsoft Corp.',     asset_class: 'stock',     sector: 'technology',    risk_level: 6,  min_budget: 1   },
  NVDA:      { name: 'NVIDIA Corp.',        asset_class: 'stock',     sector: 'technology',    risk_level: 8,  min_budget: 1   },
  JNJ:       { name: 'Johnson & Johnson',   asset_class: 'stock',     sector: 'healthcare',    risk_level: 3,  min_budget: 1   },
  'BRK-B':   { name: 'Berkshire Hathaway', asset_class: 'stock',     sector: 'financials',    risk_level: 4,  min_budget: 200 },
  SCHD:      { name: 'Dividend Growth ETF', asset_class: 'etf',       sector: 'dividend',      risk_level: 4,  min_budget: 1   },
  'BTC-USD': { name: 'Bitcoin',             asset_class: 'crypto',    sector: 'crypto',        risk_level: 9,  min_budget: 1   },
  'ETH-USD': { name: 'Ethereum',            asset_class: 'crypto',    sector: 'crypto',        risk_level: 9,  min_budget: 1   },
  'SOL-USD': { name: 'Solana',              asset_class: 'crypto',    sector: 'crypto',        risk_level: 10, min_budget: 1   },
  SGOV:      { name: '3-Month T-Bill ETF',  asset_class: 'cash',      sector: 'cash',          risk_level: 1,  min_budget: 1   },
};
