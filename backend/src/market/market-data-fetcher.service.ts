import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SupabaseService } from '../supabase/supabase.service';
import { MOCK_SENTIMENT } from '../mock/mock-data';

const TICKER_META: Record<string, { name: string; asset_class: string; sector: string; risk_level: number }> = {
  // Broad Market ETFs
  SPY:       { name: 'S&P 500 ETF',            asset_class: 'etf',       sector: 'broad_market',  risk_level: 5 },
  IVV:       { name: 'iShares S&P 500',         asset_class: 'etf',       sector: 'broad_market',  risk_level: 5 },
  VOO:       { name: 'Vanguard S&P 500',        asset_class: 'etf',       sector: 'broad_market',  risk_level: 5 },
  VTI:       { name: 'Mercado Total EE.UU.',    asset_class: 'etf',       sector: 'broad_market',  risk_level: 5 },
  VXUS:      { name: 'ETF Internacional',       asset_class: 'etf',       sector: 'international', risk_level: 6 },
  EFA:       { name: 'ETF Mercados Desarrollados', asset_class: 'etf',    sector: 'international', risk_level: 6 },
  IWM:       { name: 'Russell 2000 Pequeñas',   asset_class: 'etf',       sector: 'broad_market',  risk_level: 7 },
  // Technology
  QQQ:       { name: 'Nasdaq 100 ETF',          asset_class: 'etf',       sector: 'technology',    risk_level: 7 },
  VGT:       { name: 'ETF Tecnología Vanguard', asset_class: 'etf',       sector: 'technology',    risk_level: 7 },
  XLK:       { name: 'Sector Tecnología SPDR',  asset_class: 'etf',       sector: 'technology',    risk_level: 7 },
  AAPL:      { name: 'Apple Inc.',              asset_class: 'stock',     sector: 'technology',    risk_level: 6 },
  MSFT:      { name: 'Microsoft Corp.',         asset_class: 'stock',     sector: 'technology',    risk_level: 6 },
  NVDA:      { name: 'NVIDIA Corp.',            asset_class: 'stock',     sector: 'technology',    risk_level: 8 },
  AMZN:      { name: 'Amazon.com Inc.',         asset_class: 'stock',     sector: 'technology',    risk_level: 7 },
  GOOGL:     { name: 'Alphabet Inc.',           asset_class: 'stock',     sector: 'technology',    risk_level: 7 },
  META:      { name: 'Meta Platforms',          asset_class: 'stock',     sector: 'technology',    risk_level: 8 },
  TSLA:      { name: 'Tesla Inc.',              asset_class: 'stock',     sector: 'technology',    risk_level: 9 },
  // Financial
  XLF:       { name: 'Sector Financiero SPDR',  asset_class: 'etf',       sector: 'finance',       risk_level: 6 },
  JPM:       { name: 'JPMorgan Chase',          asset_class: 'stock',     sector: 'finance',       risk_level: 6 },
  V:         { name: 'Visa Inc.',               asset_class: 'stock',     sector: 'finance',       risk_level: 6 },
  // Healthcare
  XLV:       { name: 'Sector Salud SPDR',       asset_class: 'etf',       sector: 'healthcare',    risk_level: 5 },
  JNJ:       { name: 'Johnson & Johnson',       asset_class: 'stock',     sector: 'healthcare',    risk_level: 4 },
  UNH:       { name: 'UnitedHealth Group',      asset_class: 'stock',     sector: 'healthcare',    risk_level: 5 },
  // Consumer / Defensive
  XLP:       { name: 'Consumo Básico SPDR',     asset_class: 'etf',       sector: 'consumer',      risk_level: 3 },
  KO:        { name: 'Coca-Cola Co.',           asset_class: 'stock',     sector: 'consumer',      risk_level: 3 },
  WMT:       { name: 'Walmart Inc.',            asset_class: 'stock',     sector: 'consumer',      risk_level: 4 },
  PG:        { name: 'Procter & Gamble',        asset_class: 'stock',     sector: 'consumer',      risk_level: 3 },
  // Energy
  XLE:       { name: 'Sector Energía SPDR',     asset_class: 'etf',       sector: 'energy',        risk_level: 6 },
  // Dividends
  SCHD:      { name: 'ETF Dividendos Schwab',   asset_class: 'etf',       sector: 'dividend',      risk_level: 4 },
  VYM:       { name: 'ETF Alto Dividendo Vanguard', asset_class: 'etf',   sector: 'dividend',      risk_level: 4 },
  // Real Estate
  VNQ:       { name: 'REIT Bienes Raíces Vanguard', asset_class: 'reit',  sector: 'real_estate',   risk_level: 5 },
  O:         { name: 'Realty Income Corp.',     asset_class: 'reit',      sector: 'real_estate',   risk_level: 4 },
  // Bonds
  BND:       { name: 'Bonos Total EE.UU.',      asset_class: 'bond',      sector: 'bonds',         risk_level: 2 },
  AGG:       { name: 'iShares Bonos Totales',   asset_class: 'bond',      sector: 'bonds',         risk_level: 2 },
  TLT:       { name: 'Bonos del Tesoro 20A+',   asset_class: 'bond',      sector: 'bonds',         risk_level: 3 },
  SHY:       { name: 'Bonos del Tesoro 1-3A',   asset_class: 'bond',      sector: 'bonds',         risk_level: 1 },
  HYG:       { name: 'Bonos Alto Rendimiento',  asset_class: 'bond',      sector: 'bonds',         risk_level: 5 },
  TIP:       { name: 'Bonos Protección Inflación', asset_class: 'bond',   sector: 'bonds',         risk_level: 2 },
  // Commodities
  GLD:       { name: 'ETF de Oro SPDR',         asset_class: 'commodity', sector: 'commodities',   risk_level: 4 },
  SLV:       { name: 'ETF de Plata iShares',    asset_class: 'commodity', sector: 'commodities',   risk_level: 5 },
  // Cash
  SGOV:      { name: 'Letras del Tesoro 3M',    asset_class: 'cash',      sector: 'cash',          risk_level: 1 },
  BIL:       { name: 'SPDR Letras del Tesoro',  asset_class: 'cash',      sector: 'cash',          risk_level: 1 },
  // Crypto (via CoinGecko)
  'BTC-USD': { name: 'Bitcoin',                 asset_class: 'crypto',    sector: 'crypto',        risk_level: 9 },
  'ETH-USD': { name: 'Ethereum',               asset_class: 'crypto',    sector: 'crypto',        risk_level: 9 },
  'SOL-USD': { name: 'Solana',                 asset_class: 'crypto',    sector: 'crypto',        risk_level: 10 },
};

const STOCK_TICKERS = [
  'SPY','IVV','VOO','VTI','VXUS','EFA','IWM',
  'QQQ','VGT','XLK','AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA',
  'XLF','JPM','V',
  'XLV','JNJ','UNH',
  'XLP','KO','WMT','PG',
  'XLE',
  'SCHD','VYM',
  'VNQ','O',
  'BND','AGG','TLT','SHY','HYG','TIP',
  'GLD','SLV',
  'SGOV','BIL',
];
const CRYPTO_TICKERS: Record<string, string> = {
  'BTC-USD': 'bitcoin',
  'ETH-USD': 'ethereum',
  'SOL-USD': 'solana',
};

const FEAR_GREED_ES: Record<string, string> = {
  'Extreme Fear': 'Miedo Extremo',
  'Fear':         'Miedo',
  'Neutral':      'Neutral',
  'Greed':        'Codicia',
  'Extreme Greed':'Codicia Extrema',
};

const PRICES_TTL_MS    = 60 * 60 * 1000;
const SENTIMENT_TTL_MS = 6 * 60 * 60 * 1000;

const YF = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
  },
});

const MEM_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class MarketDataFetcherService {
  private readonly log = new Logger('MarketDataFetcher');

  private memPrices:    Record<string, any> | null = null;
  private memPricesAt:  number = 0;

  constructor(private supabase: SupabaseService) {}

  // ─── Prices ────────────────────────────────────────────────────────────────

  async getPricesWithRefresh(): Promise<Record<string, any>> {
    // In-memory cache: skip all external API calls if prices are recent
    if (this.memPrices && Date.now() - this.memPricesAt < MEM_CACHE_TTL_MS) {
      return this.memPrices;
    }

    // Start with fallback so we always return all tickers
    const base = this.buildFallbackPrices();

    try {
      // 1. Crypto: always fetch from CoinGecko (fast, free, reliable)
      const cryptoResult = await this.fetchCryptoPrices().catch(() => ({}));
      Object.assign(base, cryptoResult);

      // 2. Stocks/ETFs: check Supabase cache first
      if (this.supabase.isConfigured()) {
        const { data: cached } = await this.supabase.db!
          .from('prices_cache')
          .select('*')
          .not('ticker', 'in', `(${Object.keys(CRYPTO_TICKERS).map(t => `"${t}"`).join(',')})`)
          .order('updated_at', { ascending: false })
          .limit(1);

        const isFresh = cached?.length && !this.isStale(cached[0]?.updated_at, PRICES_TTL_MS);

        if (isFresh) {
          const { data: allCached } = await this.supabase.db!.from('prices_cache').select('*');
          if (allCached?.length) {
            const cachedMap = Object.fromEntries(allCached.map((p: any) => [p.ticker, p]));
            // Merge: real crypto prices override cache; cached stocks override fallback
            this.log.log(`Stocks from Supabase cache + CoinGecko crypto`);
            const result = { ...base, ...cachedMap, ...cryptoResult };
            this.memPrices = result;
            this.memPricesAt = Date.now();
            return result;
          }
        }

        // Cache stale: fetch fresh stock prices with a hard 25s timeout
        this.log.log('Fetching fresh stock prices...');
        let timeoutId: ReturnType<typeof setTimeout>;
        const freshStocks = await Promise.race([
          this.fetchStockPrices().finally(() => clearTimeout(timeoutId)),
          new Promise<Record<string, any>>(resolve => {
            timeoutId = setTimeout(() => {
              this.log.warn('Stock fetch timed out after 25s — caching fallback prices');
              resolve({});
            }, 25000);
          }),
        ]);

        if (Object.keys(freshStocks).length > 0) {
          Object.assign(base, freshStocks);
          await this.savePricesToSupabase({ ...freshStocks, ...cryptoResult });
        } else {
          // All APIs unavailable — cache fallback so next request is instant
          this.log.log('Caching fallback prices to avoid repeated API calls');
          await this.savePricesToSupabase({ ...base, ...cryptoResult });
        }
      }
    } catch (err) {
      this.log.warn('Price pipeline error: ' + (err as Error).message);
    }

    this.memPrices = base;
    this.memPricesAt = Date.now();
    return base;
  }

  // Stocks/ETFs via Twelve Data (batch, free tier 800 req/day)
  private async fetchStockPrices(): Promise<Record<string, any>> {
    const apiKey = process.env.TWELVE_DATA_KEY;
    if (apiKey) {
      const result = await this.fetchStockPricesTwelveData(apiKey);
      if (Object.keys(result).length > 0) return result;
    }
    // Fallback: Yahoo Finance (may be rate-limited)
    return this.fetchStockPricesYahoo();
  }

  private async fetchStockPricesTwelveData(apiKey: string): Promise<Record<string, any>> {
    const map: Record<string, any> = {};
    // Batch in two calls of ~21 tickers to stay well within URL limits
    const batches = [STOCK_TICKERS.slice(0, 21), STOCK_TICKERS.slice(21)];
    let ok = 0;

    for (const batch of batches) {
      try {
        const symbols = batch.join(',');
        const { data } = await axios.get(
          `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`,
          { timeout: 15000 }
        );

        // Detect Twelve Data rate-limit response early
        if (data?.code === 429 || data?.message?.includes('out of API credits')) {
          this.log.warn('Twelve Data rate-limited — bailing early');
          break;
        }

        // Multi-symbol response: { TICKER: {...}, ... } | Single: { symbol, close, ... }
        const entries: Record<string, any> = (data?.symbol && !data[batch[0]])
          ? { [data.symbol]: data }
          : data;

        for (const ticker of batch) {
          const q = entries[ticker];
          if (!q || q.status === 'error' || !q.close) continue;
          const m = TICKER_META[ticker]!;
          map[ticker] = {
            ticker,
            name:          m.name,
            price:         Math.round(parseFloat(q.close) * 100) / 100,
            change_1d_pct: Math.round(parseFloat(q.percent_change ?? '0') * 100) / 100,
            asset_class:   m.asset_class,
            sector:        m.sector,
            risk_level:    m.risk_level,
            updated_at:    new Date().toISOString(),
          };
          ok++;
        }
      } catch (err: any) {
        this.log.warn(`Twelve Data batch error: ${(err as Error).message}`);
      }
      // Respect 8 req/min limit: wait 8s between batches
      await new Promise(r => setTimeout(r, 8000));
    }

    this.log.log(`Twelve Data: ${ok}/${STOCK_TICKERS.length} stocks fetched`);
    return map;
  }

  private async fetchStockPricesYahoo(): Promise<Record<string, any>> {
    const map: Record<string, any> = {};
    let ok = 0;

    for (const ticker of STOCK_TICKERS) {
      try {
        const { data } = await YF.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d&includePrePost=false`
        );
        const result = data?.chart?.result?.[0];
        if (!result) continue;

        const meta      = result.meta ?? {};
        const price     = meta.regularMarketPrice ?? 0;
        const prevClose = meta.chartPreviousClose ?? price;
        const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
        const m         = TICKER_META[ticker]!;

        map[ticker] = {
          ticker,
          name:          m.name,
          price:         Math.round(price * 100) / 100,
          change_1d_pct: Math.round(changePct * 100) / 100,
          asset_class:   m.asset_class,
          sector:        m.sector,
          risk_level:    m.risk_level,
          updated_at:    new Date().toISOString(),
        };
        ok++;
      } catch (err: any) {
        if (err?.response?.status === 429) {
          this.log.warn('Yahoo Finance rate-limited — bailing early, using fallback prices');
          break; // Don't retry remaining tickers; 25s timeout will catch this gracefully
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }

    this.log.log(`Yahoo Finance: ${ok}/${STOCK_TICKERS.length} stocks fetched`);
    return map;
  }

  // Crypto via CoinGecko (free, no auth, reliable)
  private async fetchCryptoPrices(): Promise<Record<string, any>> {
    const ids = Object.values(CRYPTO_TICKERS).join(',');
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { timeout: 5000 }
    );

    const map: Record<string, any> = {};
    for (const [ticker, geckoId] of Object.entries(CRYPTO_TICKERS)) {
      const entry = data[geckoId];
      if (!entry) continue;
      const m = TICKER_META[ticker]!;
      map[ticker] = {
        ticker,
        name:          m.name,
        price:         entry.usd,
        change_1d_pct: Math.round((entry.usd_24h_change ?? 0) * 100) / 100,
        asset_class:   m.asset_class,
        sector:        m.sector,
        risk_level:    m.risk_level,
        updated_at:    new Date().toISOString(),
      };
    }

    this.log.log(`CoinGecko: ${Object.keys(map).length} crypto prices fetched`);
    return map;
  }

  private async savePricesToSupabase(prices: Record<string, any>): Promise<void> {
    const rows = Object.values(prices);
    const { error } = await this.supabase.db!
      .from('prices_cache')
      .upsert(rows, { onConflict: 'ticker' });
    if (error) this.log.warn('Prices upsert: ' + error.message);
    else this.log.log(`${rows.length} prices saved to Supabase`);
  }

  // ─── Sentiment ─────────────────────────────────────────────────────────────

  async getSentimentWithRefresh(): Promise<any> {
    if (this.supabase.isConfigured()) {
      try {
        const { data } = await this.supabase.db!
          .from('sentiment_cache').select('*').eq('id', 1).single();

        if (data && !this.isStale(data.updated_at, SENTIMENT_TTL_MS)) {
          return {
            ...data,
            top_headlines: typeof data.top_headlines === 'string'
              ? JSON.parse(data.top_headlines)
              : data.top_headlines,
          };
        }

        const fresh = await this.fetchSentiment();
        await this.saveSentimentToSupabase(fresh);
        return fresh;
      } catch (err) {
        this.log.warn('Sentiment error: ' + (err as Error).message);
      }
    }
    return { ...MOCK_SENTIMENT };
  }

  private async fetchSentiment(): Promise<any> {
    const [fg, ty, hl] = await Promise.allSettled([
      this.fetchFearGreed(),
      this.fetchTreasury10Y(),
      this.fetchHeadlines(),
    ]);
    return {
      fear_greed:       fg.status === 'fulfilled' ? fg.value.value : 50,
      fear_greed_label: fg.status === 'fulfilled' ? fg.value.label : 'Neutral',
      treasury_10y:     ty.status === 'fulfilled' ? ty.value : 4.42,
      top_headlines:    hl.status === 'fulfilled' ? hl.value : MOCK_SENTIMENT.top_headlines,
      updated_at:       new Date().toISOString(),
    };
  }

  private async fetchFearGreed(): Promise<{ value: number; label: string }> {
    const { data } = await axios.get('https://api.alternative.me/fng/', { timeout: 8000 });
    const item    = data?.data?.[0];
    const value   = parseInt(item?.value ?? '50', 10);
    const labelEn = item?.value_classification ?? 'Neutral';
    return { value, label: FEAR_GREED_ES[labelEn] ?? labelEn };
  }

  private async fetchTreasury10Y(): Promise<number> {
    const key = process.env.FRED_API_KEY;
    if (!key) return 4.42;
    const { data } = await axios.get(
      `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${key}&limit=5&sort_order=desc&file_type=json`,
      { timeout: 8000 }
    );
    const obs = (data?.observations ?? []).find((o: any) => o.value !== '.' && o.value !== '');
    return obs ? parseFloat(obs.value) : 4.42;
  }

  private async fetchHeadlines(): Promise<string[]> {
    const key = process.env.NEWSAPI_KEY;
    if (!key) return MOCK_SENTIMENT.top_headlines;
    const { data } = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=5&apiKey=${key}`,
      { timeout: 8000 }
    );
    return (data?.articles ?? []).slice(0, 5).map((a: any) => a.title).filter(Boolean);
  }

  private async saveSentimentToSupabase(sentiment: any): Promise<void> {
    const { error } = await this.supabase.db!.from('sentiment_cache').upsert({
      id:               1,
      fear_greed:       sentiment.fear_greed,
      fear_greed_label: sentiment.fear_greed_label,
      treasury_10y:     sentiment.treasury_10y,
      top_headlines:    JSON.stringify(sentiment.top_headlines),
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) this.log.warn('Sentiment upsert: ' + error.message);
    else this.log.log('Sentiment cached');
  }

  private buildFallbackPrices(): Record<string, any> {
    const fallback: Record<string, number> = {
      SPY: 735, IVV: 735, VOO: 675, VTI: 292, VXUS: 65, EFA: 82, IWM: 210,
      QQQ: 500, VGT: 620, XLK: 250, AAPL: 213, MSFT: 432, NVDA: 1100,
      AMZN: 210, GOOGL: 175, META: 620, TSLA: 270,
      XLF: 50, JPM: 270, V: 365,
      XLV: 145, JNJ: 155, UNH: 480,
      XLP: 82, KO: 70, WMT: 105, PG: 175,
      XLE: 88,
      SCHD: 82, VYM: 126,
      VNQ: 82, O: 55,
      BND: 72, AGG: 95, TLT: 88, SHY: 83, HYG: 77, TIP: 105,
      GLD: 312, SLV: 32,
      SGOV: 100.5, BIL: 91.5,
      'BTC-USD': 76700, 'ETH-USD': 2110, 'SOL-USD': 84,
    };
    const out: Record<string, any> = {};
    for (const [ticker, meta] of Object.entries(TICKER_META)) {
      out[ticker] = { ticker, ...meta, price: fallback[ticker] ?? 100, change_1d_pct: null, updated_at: new Date().toISOString() };
    }
    return out;
  }

  private isStale(updatedAt: string | undefined, ttlMs: number): boolean {
    if (!updatedAt) return true;
    return Date.now() - new Date(updatedAt).getTime() > ttlMs;
  }
}
