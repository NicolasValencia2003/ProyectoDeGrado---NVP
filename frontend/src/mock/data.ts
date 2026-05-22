import type { Recommendation, RecommendationItem } from '../types';

export const MOCK_PRICES_FRONTEND: Record<string, any> = {
  SPY: { ticker: 'SPY', name: 'S&P 500 ETF', price: 524.10, change_1d_pct: 0.42, asset_class: 'etf', sector: 'broad_market', risk_level: 5, updated_at: new Date().toISOString() },
  QQQ: { ticker: 'QQQ', name: 'Nasdaq 100 ETF', price: 445.32, change_1d_pct: 0.87, asset_class: 'etf', sector: 'technology', risk_level: 7, updated_at: new Date().toISOString() },
  'BTC-USD': { ticker: 'BTC-USD', name: 'Bitcoin', price: 68420, change_1d_pct: -1.23, asset_class: 'crypto', sector: 'crypto', risk_level: 9, updated_at: new Date().toISOString() },
  GLD: { ticker: 'GLD', name: 'Gold ETF', price: 224.85, change_1d_pct: 0.61, asset_class: 'commodity', sector: 'commodities', risk_level: 4, updated_at: new Date().toISOString() },
  'ETH-USD': { ticker: 'ETH-USD', name: 'Ethereum', price: 3840, change_1d_pct: -0.87, asset_class: 'crypto', sector: 'crypto', risk_level: 9, updated_at: new Date().toISOString() },
};

// Full pool of educational assets used as fallback for replacements.
// Keyed by asset_class so getMockReplacement can prioritize same-class alternatives.
const ASSET_POOL: Record<string, RecommendationItem[]> = {
  etf: [
    { ticker: 'SPY',  name: 'S&P 500 ETF',            allocation_pct: 0, asset_class: 'etf', sector: 'broad_market',  current_price: 524.10, change_1d_pct: 0.42,  rationale: '', key_risk: '' },
    { ticker: 'QQQ',  name: 'Nasdaq 100 ETF',          allocation_pct: 0, asset_class: 'etf', sector: 'technology',    current_price: 445.32, change_1d_pct: 0.87,  rationale: '', key_risk: '' },
    { ticker: 'VTI',  name: 'Vanguard Total Market ETF', allocation_pct: 0, asset_class: 'etf', sector: 'broad_market', current_price: 255.60, change_1d_pct: 0.38, rationale: '', key_risk: '' },
    { ticker: 'IWM',  name: 'iShares Russell 2000 ETF', allocation_pct: 0, asset_class: 'etf', sector: 'small_cap',    current_price: 198.45, change_1d_pct: 0.55,  rationale: '', key_risk: '' },
    { ticker: 'EFA',  name: 'iShares MSCI EAFE ETF',   allocation_pct: 0, asset_class: 'etf', sector: 'international', current_price: 82.30,  change_1d_pct: 0.21,  rationale: '', key_risk: '' },
    { ticker: 'VEA',  name: 'Vanguard FTSE Developed Markets ETF', allocation_pct: 0, asset_class: 'etf', sector: 'international', current_price: 51.20, change_1d_pct: 0.18, rationale: '', key_risk: '' },
    { ticker: 'XLK',  name: 'Technology Select Sector ETF', allocation_pct: 0, asset_class: 'etf', sector: 'technology', current_price: 228.40, change_1d_pct: 1.02, rationale: '', key_risk: '' },
    { ticker: 'XLV',  name: 'Health Care Select Sector ETF', allocation_pct: 0, asset_class: 'etf', sector: 'healthcare', current_price: 144.70, change_1d_pct: 0.15, rationale: '', key_risk: '' },
  ],
  bond: [
    { ticker: 'AGG',  name: 'iShares Core US Aggregate Bond ETF', allocation_pct: 0, asset_class: 'bond', sector: 'fixed_income', current_price: 98.12,  change_1d_pct: 0.08,  rationale: '', key_risk: '' },
    { ticker: 'TLT',  name: 'iShares 20+ Year Treasury Bond ETF', allocation_pct: 0, asset_class: 'bond', sector: 'government',   current_price: 91.40,  change_1d_pct: -0.25, rationale: '', key_risk: '' },
    { ticker: 'BND',  name: 'Vanguard Total Bond Market ETF',     allocation_pct: 0, asset_class: 'bond', sector: 'fixed_income', current_price: 73.80,  change_1d_pct: 0.06,  rationale: '', key_risk: '' },
    { ticker: 'IEF',  name: 'iShares 7-10 Year Treasury Bond ETF', allocation_pct: 0, asset_class: 'bond', sector: 'government',  current_price: 95.20,  change_1d_pct: -0.10, rationale: '', key_risk: '' },
    { ticker: 'LQD',  name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', allocation_pct: 0, asset_class: 'bond', sector: 'corporate', current_price: 108.50, change_1d_pct: 0.04, rationale: '', key_risk: '' },
  ],
  stock: [
    { ticker: 'AAPL', name: 'Apple Inc',               allocation_pct: 0, asset_class: 'stock', sector: 'technology',  current_price: 189.30, change_1d_pct: 0.65,  rationale: '', key_risk: '' },
    { ticker: 'MSFT', name: 'Microsoft Corp',           allocation_pct: 0, asset_class: 'stock', sector: 'technology',  current_price: 425.52, change_1d_pct: 0.52,  rationale: '', key_risk: '' },
    { ticker: 'GOOGL',name: 'Alphabet Inc',             allocation_pct: 0, asset_class: 'stock', sector: 'technology',  current_price: 178.60, change_1d_pct: 0.83,  rationale: '', key_risk: '' },
    { ticker: 'AMZN', name: 'Amazon.com Inc',           allocation_pct: 0, asset_class: 'stock', sector: 'consumer',    current_price: 192.80, change_1d_pct: 1.12,  rationale: '', key_risk: '' },
    { ticker: 'NVDA', name: 'NVIDIA Corp',              allocation_pct: 0, asset_class: 'stock', sector: 'technology',  current_price: 142.30, change_1d_pct: 1.42,  rationale: '', key_risk: '' },
    { ticker: 'JNJ',  name: 'Johnson & Johnson',        allocation_pct: 0, asset_class: 'stock', sector: 'healthcare',  current_price: 148.20, change_1d_pct: -0.18, rationale: '', key_risk: '' },
    { ticker: 'JPM',  name: 'JPMorgan Chase & Co',      allocation_pct: 0, asset_class: 'stock', sector: 'financials',  current_price: 212.40, change_1d_pct: 0.42,  rationale: '', key_risk: '' },
    { ticker: 'BRK-B',name: 'Berkshire Hathaway B',    allocation_pct: 0, asset_class: 'stock', sector: 'financials',  current_price: 394.10, change_1d_pct: 0.31,  rationale: '', key_risk: '' },
  ],
  crypto: [
    { ticker: 'BTC-USD', name: 'Bitcoin',             allocation_pct: 0, asset_class: 'crypto', sector: 'crypto', current_price: 68420, change_1d_pct: -1.23, rationale: '', key_risk: '' },
    { ticker: 'ETH-USD', name: 'Ethereum',            allocation_pct: 0, asset_class: 'crypto', sector: 'crypto', current_price: 3840,  change_1d_pct: -0.87, rationale: '', key_risk: '' },
    { ticker: 'SOL-USD', name: 'Solana',              allocation_pct: 0, asset_class: 'crypto', sector: 'crypto', current_price: 172.50, change_1d_pct: 2.10, rationale: '', key_risk: '' },
  ],
  commodity: [
    { ticker: 'GLD',  name: 'Gold ETF',               allocation_pct: 0, asset_class: 'commodity', sector: 'commodities', current_price: 224.85, change_1d_pct: 0.61,  rationale: '', key_risk: '' },
    { ticker: 'SLV',  name: 'Silver ETF',             allocation_pct: 0, asset_class: 'commodity', sector: 'commodities', current_price: 27.40,  change_1d_pct: 0.82,  rationale: '', key_risk: '' },
    { ticker: 'USO',  name: 'United States Oil Fund', allocation_pct: 0, asset_class: 'commodity', sector: 'energy',      current_price: 79.30,  change_1d_pct: -0.50, rationale: '', key_risk: '' },
    { ticker: 'PDBC', name: 'Invesco DB Optimum Yield Diversified Commodity ETF', allocation_pct: 0, asset_class: 'commodity', sector: 'commodities', current_price: 15.80, change_1d_pct: 0.19, rationale: '', key_risk: '' },
  ],
  reit: [
    { ticker: 'VNQ',  name: 'Vanguard Real Estate ETF',         allocation_pct: 0, asset_class: 'reit', sector: 'real_estate', current_price: 91.40, change_1d_pct: 0.22,  rationale: '', key_risk: '' },
    { ticker: 'SCHH', name: 'Schwab US REIT ETF',               allocation_pct: 0, asset_class: 'reit', sector: 'real_estate', current_price: 21.80, change_1d_pct: 0.18,  rationale: '', key_risk: '' },
    { ticker: 'IYR',  name: 'iShares US Real Estate ETF',       allocation_pct: 0, asset_class: 'reit', sector: 'real_estate', current_price: 85.60, change_1d_pct: 0.30,  rationale: '', key_risk: '' },
    { ticker: 'O',    name: 'Realty Income Corp',                allocation_pct: 0, asset_class: 'reit', sector: 'real_estate', current_price: 54.20, change_1d_pct: -0.12, rationale: '', key_risk: '' },
  ],
  cash: [
    { ticker: 'BIL',  name: 'SPDR 1-3 Month T-Bill ETF',       allocation_pct: 0, asset_class: 'cash', sector: 'cash', current_price: 91.55, change_1d_pct: 0.01, rationale: '', key_risk: '' },
    { ticker: 'SGOV', name: 'iShares 0-3 Month Treasury Bond ETF', allocation_pct: 0, asset_class: 'cash', sector: 'cash', current_price: 100.42, change_1d_pct: 0.01, rationale: '', key_risk: '' },
    { ticker: 'SHY',  name: 'iShares 1-3 Year Treasury Bond ETF', allocation_pct: 0, asset_class: 'cash', sector: 'cash', current_price: 82.10, change_1d_pct: 0.02, rationale: '', key_risk: '' },
  ],
};

function assetRationale(asset: RecommendationItem, riskScore: number): string {
  return `${asset.name} es un ejemplo educativo de la clase "${asset.asset_class}" que puede complementar un portafolio para perfil de riesgo ${riskScore}/10, permitiendo entender cómo distintos activos responden a condiciones del mercado.`;
}

function assetKeyRisk(asset: RecommendationItem): string {
  const risks: Record<string, string> = {
    etf:       'Los ETFs pueden fluctuar con el índice que replican; en días de alta volatilidad el precio puede alejarse del valor neto de activos.',
    bond:      'Los bonos pierden valor cuando las tasas de interés suben; a mayor duración, mayor sensibilidad al cambio de tasas.',
    stock:     'Las acciones individuales concentran el riesgo en una sola empresa; pueden caer bruscamente ante malos resultados o noticias sectoriales.',
    crypto:    'Los criptoactivos son altamente volátiles y no están respaldados por un banco central; pueden perder gran parte de su valor en días.',
    commodity: 'Las materias primas dependen de ciclos económicos y geopolítica; sus precios pueden ser muy volátiles a corto plazo.',
    reit:      'Los REITs son sensibles a las tasas de interés y al ciclo inmobiliario; pueden caer junto con el mercado de bienes raíces.',
    cash:      'Los instrumentos de cash protegen el capital pero pierden poder adquisitivo con la inflación a largo plazo.',
  };
  return risks[asset.asset_class] ?? `Como activo de tipo ${asset.asset_class}, su valor puede fluctuar según condiciones del mercado.`;
}

/**
 * Returns a mock replacement asset of the same class as `preferredClass`,
 * excluding all tickers in `excludedTickers`. Falls back to any other class
 * if the preferred class is exhausted.
 */
export function getMockReplacement(
  preferredClass: string,
  excludedTickers: string[],
  allocationPct: number,
  riskScore: number,
): RecommendationItem | null {
  const excluded = new Set(excludedTickers);

  // Try same class first, then all others
  const classOrder = [preferredClass, ...Object.keys(ASSET_POOL).filter(c => c !== preferredClass)];

  for (const cls of classOrder) {
    const candidates = (ASSET_POOL[cls] ?? []).filter(a => !excluded.has(a.ticker));
    if (candidates.length === 0) continue;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      ...picked,
      allocation_pct: allocationPct,
      rationale: assetRationale(picked, riskScore),
      key_risk:  assetKeyRisk(picked),
    };
  }

  return null;
}

export function buildMockRecommendation(riskScore: number): Recommendation {
  const aggressive = riskScore >= 7;
  const conservative = riskScore <= 4;

  const items = conservative
    ? [
        { ticker: 'AGG',     name: 'iShares Core US Aggregate Bond ETF', allocation_pct: 40, asset_class: 'bond',      sector: 'fixed_income',  current_price: 98.12,  change_1d_pct: 0.08 },
        { ticker: 'SPY',     name: 'S&P 500 ETF',                        allocation_pct: 25, asset_class: 'etf',       sector: 'broad_market',  current_price: 524.10, change_1d_pct: 0.42 },
        { ticker: 'GLD',     name: 'Gold ETF',                           allocation_pct: 15, asset_class: 'commodity', sector: 'commodities',   current_price: 224.85, change_1d_pct: 0.61 },
        { ticker: 'VNQ',     name: 'Vanguard Real Estate ETF',           allocation_pct: 10, asset_class: 'reit',      sector: 'real_estate',   current_price: 91.40,  change_1d_pct: 0.22 },
        { ticker: 'BIL',     name: 'SPDR 1-3 Month T-Bill ETF',          allocation_pct: 10, asset_class: 'cash',      sector: 'cash',          current_price: 91.55,  change_1d_pct: 0.01 },
      ]
    : aggressive
      ? [
          { ticker: 'QQQ',     name: 'Nasdaq 100 ETF',                   allocation_pct: 30, asset_class: 'etf',       sector: 'technology',    current_price: 445.32, change_1d_pct: 0.87 },
          { ticker: 'SPY',     name: 'S&P 500 ETF',                      allocation_pct: 25, asset_class: 'etf',       sector: 'broad_market',  current_price: 524.10, change_1d_pct: 0.42 },
          { ticker: 'BTC-USD', name: 'Bitcoin',                          allocation_pct: 20, asset_class: 'crypto',    sector: 'crypto',        current_price: 68420,  change_1d_pct: -1.23 },
          { ticker: 'NVDA',    name: 'NVIDIA Corp',                      allocation_pct: 15, asset_class: 'stock',     sector: 'technology',    current_price: 142.30, change_1d_pct: 1.42 },
          { ticker: 'GLD',     name: 'Gold ETF',                         allocation_pct: 10, asset_class: 'commodity', sector: 'commodities',   current_price: 224.85, change_1d_pct: 0.61 },
        ]
      : [
          { ticker: 'SPY',     name: 'S&P 500 ETF',                      allocation_pct: 30, asset_class: 'etf',       sector: 'broad_market',  current_price: 524.10, change_1d_pct: 0.42 },
          { ticker: 'AGG',     name: 'iShares Core US Aggregate Bond ETF', allocation_pct: 25, asset_class: 'bond',    sector: 'fixed_income',  current_price: 98.12,  change_1d_pct: 0.08 },
          { ticker: 'QQQ',     name: 'Nasdaq 100 ETF',                   allocation_pct: 20, asset_class: 'etf',       sector: 'technology',    current_price: 445.32, change_1d_pct: 0.87 },
          { ticker: 'VNQ',     name: 'Vanguard Real Estate ETF',         allocation_pct: 15, asset_class: 'reit',      sector: 'real_estate',   current_price: 91.40,  change_1d_pct: 0.22 },
          { ticker: 'GLD',     name: 'Gold ETF',                         allocation_pct: 10, asset_class: 'commodity', sector: 'commodities',   current_price: 224.85, change_1d_pct: 0.61 },
        ];

  return {
    recommendations: items.map(it => ({
      ...it,
      rationale: assetRationale(it as RecommendationItem, riskScore),
      key_risk:  assetKeyRisk(it as RecommendationItem),
    })),
    market_summary: 'Resumen educativo: los mercados muestran señales mixtas hoy. Este portafolio ilustrativo combina diversas clases de activos para fines de aprendizaje sobre diversificación.',
    disclaimer: 'Este contenido es material educativo generado por FinVise, plataforma académica de la Pontificia Universidad Javeriana Cali. No constituye asesoramiento financiero personalizado.',
  };
}
