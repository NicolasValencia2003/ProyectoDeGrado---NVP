export const MOCK_PRICES_FRONTEND: Record<string, any> = {
  SPY: { ticker: 'SPY', name: 'S&P 500 ETF', price: 524.10, change_1d_pct: 0.42, asset_class: 'etf', sector: 'broad_market', risk_level: 5, updated_at: new Date().toISOString() },
  QQQ: { ticker: 'QQQ', name: 'Nasdaq 100 ETF', price: 445.32, change_1d_pct: 0.87, asset_class: 'etf', sector: 'technology', risk_level: 7, updated_at: new Date().toISOString() },
  'BTC-USD': { ticker: 'BTC-USD', name: 'Bitcoin', price: 68420, change_1d_pct: -1.23, asset_class: 'crypto', sector: 'crypto', risk_level: 9, updated_at: new Date().toISOString() },
  GLD: { ticker: 'GLD', name: 'Gold ETF', price: 224.85, change_1d_pct: 0.61, asset_class: 'commodity', sector: 'commodities', risk_level: 4, updated_at: new Date().toISOString() },
  'ETH-USD': { ticker: 'ETH-USD', name: 'Ethereum', price: 3840, change_1d_pct: -0.87, asset_class: 'crypto', sector: 'crypto', risk_level: 9, updated_at: new Date().toISOString() },
};
