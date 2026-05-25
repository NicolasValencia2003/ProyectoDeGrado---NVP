"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataFetcherService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const supabase_service_1 = require("../supabase/supabase.service");
const TICKER_META = {
    SPY: { name: 'S&P 500 ETF', asset_class: 'etf', sector: 'broad_market', risk_level: 5 },
    IVV: { name: 'iShares S&P 500', asset_class: 'etf', sector: 'broad_market', risk_level: 5 },
    VOO: { name: 'Vanguard S&P 500', asset_class: 'etf', sector: 'broad_market', risk_level: 5 },
    VTI: { name: 'Mercado Total EE.UU.', asset_class: 'etf', sector: 'broad_market', risk_level: 5 },
    VXUS: { name: 'ETF Internacional', asset_class: 'etf', sector: 'international', risk_level: 6 },
    EFA: { name: 'ETF Mercados Desarrollados', asset_class: 'etf', sector: 'international', risk_level: 6 },
    IWM: { name: 'Russell 2000 Pequeñas', asset_class: 'etf', sector: 'broad_market', risk_level: 7 },
    QQQ: { name: 'Nasdaq 100 ETF', asset_class: 'etf', sector: 'technology', risk_level: 7 },
    VGT: { name: 'ETF Tecnología Vanguard', asset_class: 'etf', sector: 'technology', risk_level: 7 },
    XLK: { name: 'Sector Tecnología SPDR', asset_class: 'etf', sector: 'technology', risk_level: 7 },
    AAPL: { name: 'Apple Inc.', asset_class: 'stock', sector: 'technology', risk_level: 6 },
    MSFT: { name: 'Microsoft Corp.', asset_class: 'stock', sector: 'technology', risk_level: 6 },
    NVDA: { name: 'NVIDIA Corp.', asset_class: 'stock', sector: 'technology', risk_level: 8 },
    AMZN: { name: 'Amazon.com Inc.', asset_class: 'stock', sector: 'technology', risk_level: 7 },
    GOOGL: { name: 'Alphabet Inc.', asset_class: 'stock', sector: 'technology', risk_level: 7 },
    META: { name: 'Meta Platforms', asset_class: 'stock', sector: 'technology', risk_level: 8 },
    TSLA: { name: 'Tesla Inc.', asset_class: 'stock', sector: 'technology', risk_level: 9 },
    XLF: { name: 'Sector Financiero SPDR', asset_class: 'etf', sector: 'finance', risk_level: 6 },
    JPM: { name: 'JPMorgan Chase', asset_class: 'stock', sector: 'finance', risk_level: 6 },
    V: { name: 'Visa Inc.', asset_class: 'stock', sector: 'finance', risk_level: 6 },
    XLV: { name: 'Sector Salud SPDR', asset_class: 'etf', sector: 'healthcare', risk_level: 5 },
    JNJ: { name: 'Johnson & Johnson', asset_class: 'stock', sector: 'healthcare', risk_level: 4 },
    UNH: { name: 'UnitedHealth Group', asset_class: 'stock', sector: 'healthcare', risk_level: 5 },
    XLP: { name: 'Consumo Básico SPDR', asset_class: 'etf', sector: 'consumer', risk_level: 3 },
    KO: { name: 'Coca-Cola Co.', asset_class: 'stock', sector: 'consumer', risk_level: 3 },
    WMT: { name: 'Walmart Inc.', asset_class: 'stock', sector: 'consumer', risk_level: 4 },
    PG: { name: 'Procter & Gamble', asset_class: 'stock', sector: 'consumer', risk_level: 3 },
    XLE: { name: 'Sector Energía SPDR', asset_class: 'etf', sector: 'energy', risk_level: 6 },
    SCHD: { name: 'ETF Dividendos Schwab', asset_class: 'etf', sector: 'dividend', risk_level: 4 },
    VYM: { name: 'ETF Alto Dividendo Vanguard', asset_class: 'etf', sector: 'dividend', risk_level: 4 },
    VNQ: { name: 'REIT Bienes Raíces Vanguard', asset_class: 'reit', sector: 'real_estate', risk_level: 5 },
    O: { name: 'Realty Income Corp.', asset_class: 'reit', sector: 'real_estate', risk_level: 4 },
    BND: { name: 'Bonos Total EE.UU.', asset_class: 'bond', sector: 'bonds', risk_level: 2 },
    AGG: { name: 'iShares Bonos Totales', asset_class: 'bond', sector: 'bonds', risk_level: 2 },
    TLT: { name: 'Bonos del Tesoro 20A+', asset_class: 'bond', sector: 'bonds', risk_level: 3 },
    SHY: { name: 'Bonos del Tesoro 1-3A', asset_class: 'bond', sector: 'bonds', risk_level: 1 },
    HYG: { name: 'Bonos Alto Rendimiento', asset_class: 'bond', sector: 'bonds', risk_level: 5 },
    TIP: { name: 'Bonos Protección Inflación', asset_class: 'bond', sector: 'bonds', risk_level: 2 },
    GLD: { name: 'ETF de Oro SPDR', asset_class: 'commodity', sector: 'commodities', risk_level: 4 },
    SLV: { name: 'ETF de Plata iShares', asset_class: 'commodity', sector: 'commodities', risk_level: 5 },
    SGOV: { name: 'Letras del Tesoro 3M', asset_class: 'cash', sector: 'cash', risk_level: 1 },
    BIL: { name: 'SPDR Letras del Tesoro', asset_class: 'cash', sector: 'cash', risk_level: 1 },
    'BTC-USD': { name: 'Bitcoin', asset_class: 'crypto', sector: 'crypto', risk_level: 9 },
    'ETH-USD': { name: 'Ethereum', asset_class: 'crypto', sector: 'crypto', risk_level: 9 },
    'SOL-USD': { name: 'Solana', asset_class: 'crypto', sector: 'crypto', risk_level: 10 },
};
const STOCK_TICKERS = [
    'SPY', 'IVV', 'VOO', 'VTI', 'VXUS', 'EFA', 'IWM',
    'QQQ', 'VGT', 'XLK', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA',
    'XLF', 'JPM', 'V',
    'XLV', 'JNJ', 'UNH',
    'XLP', 'KO', 'WMT', 'PG',
    'XLE',
    'SCHD', 'VYM',
    'VNQ', 'O',
    'BND', 'AGG', 'TLT', 'SHY', 'HYG', 'TIP',
    'GLD', 'SLV',
    'SGOV', 'BIL',
];
const CRYPTO_TICKERS = {
    'BTC-USD': 'bitcoin',
    'ETH-USD': 'ethereum',
    'SOL-USD': 'solana',
};
const FEAR_GREED_ES = {
    'Extreme Fear': 'Miedo Extremo',
    'Fear': 'Miedo',
    'Neutral': 'Neutral',
    'Greed': 'Codicia',
    'Extreme Greed': 'Codicia Extrema',
};
const PRICES_TTL_MS = 60 * 60 * 1000;
const SENTIMENT_TTL_MS = 6 * 60 * 60 * 1000;
const YF = axios_1.default.create({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
    },
});
const MEM_CACHE_TTL_MS = 5 * 60 * 1000;
let MarketDataFetcherService = class MarketDataFetcherService {
    supabase;
    log = new common_1.Logger('MarketDataFetcher');
    memPrices = null;
    memPricesAt = 0;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getPricesWithRefresh() {
        if (this.memPrices && Date.now() - this.memPricesAt < MEM_CACHE_TTL_MS) {
            return this.memPrices;
        }
        const result = {};
        try {
            const cryptoResult = await this.fetchCryptoPrices().catch(() => ({}));
            Object.assign(result, cryptoResult);
            if (this.supabase.isConfigured()) {
                const { data: allCached } = await this.supabase.db.from('prices_cache').select('*');
                if (allCached?.length) {
                    const fallback = this.buildFallbackPrices();
                    const cachedMap = Object.fromEntries(allCached.map((p) => [p.ticker, {
                            ...fallback[p.ticker],
                            ...p,
                            change_1d_pct: p.change_1d_pct ?? fallback[p.ticker]?.change_1d_pct ?? null,
                        }]));
                    Object.assign(result, cachedMap, cryptoResult);
                    this.log.log(`Prices from Supabase cache (${allCached.length} tickers) + CoinGecko crypto`);
                    const sample = allCached.find((p) => !CRYPTO_TICKERS[p.ticker]);
                    if (sample && this.isStale(sample.updated_at, PRICES_TTL_MS)) {
                        this.refreshStockPricesInBackground(cryptoResult);
                    }
                    this.memPrices = result;
                    this.memPricesAt = Date.now();
                    return result;
                }
            }
            this.log.log('Supabase cache empty — fetching live stock prices...');
            let timeoutId;
            const freshStocks = await Promise.race([
                this.fetchStockPrices().finally(() => clearTimeout(timeoutId)),
                new Promise(resolve => {
                    timeoutId = setTimeout(() => resolve({}), 25000);
                }),
            ]);
            if (Object.keys(freshStocks).length > 0) {
                Object.assign(result, freshStocks);
                if (this.supabase.isConfigured()) {
                    await this.savePricesToSupabase({ ...freshStocks, ...cryptoResult });
                }
            }
            else {
                this.log.warn('Stock APIs unavailable and cache empty — no price data available');
            }
        }
        catch (err) {
            this.log.warn('Price pipeline error: ' + err.message);
        }
        this.memPrices = result;
        this.memPricesAt = Date.now();
        return result;
    }
    refreshStockPricesInBackground(cryptoResult) {
        this.fetchStockPrices()
            .then(fresh => {
            if (Object.keys(fresh).length > 0 && this.supabase.isConfigured()) {
                return this.savePricesToSupabase({ ...fresh, ...cryptoResult });
            }
        })
            .catch(err => this.log.warn('Background price refresh failed: ' + err.message));
    }
    async fetchStockPrices() {
        const apiKey = process.env.TWELVE_DATA_KEY;
        if (apiKey) {
            const result = await this.fetchStockPricesTwelveData(apiKey);
            if (Object.keys(result).length > 0)
                return result;
        }
        return this.fetchStockPricesYahoo();
    }
    async fetchStockPricesTwelveData(apiKey) {
        const map = {};
        const batches = [STOCK_TICKERS.slice(0, 21), STOCK_TICKERS.slice(21)];
        let ok = 0;
        for (const batch of batches) {
            try {
                const symbols = batch.join(',');
                const { data } = await axios_1.default.get(`https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`, { timeout: 15000 });
                if (data?.code === 429 || data?.message?.includes('out of API credits')) {
                    this.log.warn('Twelve Data rate-limited — bailing early');
                    break;
                }
                const entries = (data?.symbol && !data[batch[0]])
                    ? { [data.symbol]: data }
                    : data;
                for (const ticker of batch) {
                    const q = entries[ticker];
                    if (!q || q.status === 'error' || !q.close)
                        continue;
                    const m = TICKER_META[ticker];
                    map[ticker] = {
                        ticker,
                        name: m.name,
                        price: Math.round(parseFloat(q.close) * 100) / 100,
                        change_1d_pct: Math.round(parseFloat(q.percent_change ?? '0') * 100) / 100,
                        asset_class: m.asset_class,
                        sector: m.sector,
                        risk_level: m.risk_level,
                        updated_at: new Date().toISOString(),
                    };
                    ok++;
                }
            }
            catch (err) {
                this.log.warn(`Twelve Data batch error: ${err.message}`);
            }
            await new Promise(r => setTimeout(r, 8000));
        }
        this.log.log(`Twelve Data: ${ok}/${STOCK_TICKERS.length} stocks fetched`);
        return map;
    }
    async fetchStockPricesYahoo() {
        const map = {};
        let ok = 0;
        for (const ticker of STOCK_TICKERS) {
            try {
                const { data } = await YF.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d&includePrePost=false`);
                const result = data?.chart?.result?.[0];
                if (!result)
                    continue;
                const meta = result.meta ?? {};
                const price = meta.regularMarketPrice ?? 0;
                const prevClose = meta.chartPreviousClose ?? price;
                const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
                const m = TICKER_META[ticker];
                map[ticker] = {
                    ticker,
                    name: m.name,
                    price: Math.round(price * 100) / 100,
                    change_1d_pct: Math.round(changePct * 100) / 100,
                    asset_class: m.asset_class,
                    sector: m.sector,
                    risk_level: m.risk_level,
                    updated_at: new Date().toISOString(),
                };
                ok++;
            }
            catch (err) {
                if (err?.response?.status === 429) {
                    this.log.warn('Yahoo Finance rate-limited — bailing early, using fallback prices');
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 200));
        }
        this.log.log(`Yahoo Finance: ${ok}/${STOCK_TICKERS.length} stocks fetched`);
        return map;
    }
    async fetchCryptoPrices() {
        const ids = Object.values(CRYPTO_TICKERS).join(',');
        const { data } = await axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, { timeout: 5000 });
        const map = {};
        for (const [ticker, geckoId] of Object.entries(CRYPTO_TICKERS)) {
            const entry = data[geckoId];
            if (!entry)
                continue;
            const m = TICKER_META[ticker];
            map[ticker] = {
                ticker,
                name: m.name,
                price: entry.usd,
                change_1d_pct: Math.round((entry.usd_24h_change ?? 0) * 100) / 100,
                asset_class: m.asset_class,
                sector: m.sector,
                risk_level: m.risk_level,
                updated_at: new Date().toISOString(),
            };
        }
        this.log.log(`CoinGecko: ${Object.keys(map).length} crypto prices fetched`);
        return map;
    }
    async savePricesToSupabase(prices) {
        const rows = Object.values(prices);
        const { error } = await this.supabase.db
            .from('prices_cache')
            .upsert(rows, { onConflict: 'ticker' });
        if (error)
            this.log.warn('Prices upsert: ' + error.message);
        else
            this.log.log(`${rows.length} prices saved to Supabase`);
    }
    async getSentimentWithRefresh() {
        if (this.supabase.isConfigured()) {
            try {
                const { data } = await this.supabase.db
                    .from('sentiment_cache').select('*').eq('id', 1).single();
                if (data) {
                    if (this.isStale(data.updated_at, SENTIMENT_TTL_MS)) {
                        this.fetchSentiment()
                            .then(fresh => this.saveSentimentToSupabase(fresh))
                            .catch(err => this.log.warn('Background sentiment refresh: ' + err.message));
                    }
                    return { ...data };
                }
                const fresh = await this.fetchSentiment();
                await this.saveSentimentToSupabase(fresh);
                return fresh;
            }
            catch (err) {
                this.log.warn('Sentiment error: ' + err.message);
            }
        }
        try {
            return await this.fetchSentiment();
        }
        catch {
            return {};
        }
    }
    async fetchSentiment() {
        const [fg, ty, hl] = await Promise.allSettled([
            this.fetchFearGreed(),
            this.fetchTreasury10Y(),
            this.fetchHeadlines(),
        ]);
        return {
            fear_greed: fg.status === 'fulfilled' ? fg.value.value : null,
            fear_greed_label: fg.status === 'fulfilled' ? fg.value.label : null,
            treasury_10y: ty.status === 'fulfilled' ? ty.value : null,
            top_headlines: hl.status === 'fulfilled' ? hl.value : [],
            updated_at: new Date().toISOString(),
        };
    }
    async fetchFearGreed() {
        const { data } = await axios_1.default.get('https://api.alternative.me/fng/', { timeout: 8000 });
        const item = data?.data?.[0];
        const value = parseInt(item?.value ?? '50', 10);
        const labelEn = item?.value_classification ?? 'Neutral';
        return { value, label: FEAR_GREED_ES[labelEn] ?? labelEn };
    }
    async fetchTreasury10Y() {
        const key = process.env.FRED_API_KEY;
        if (!key)
            throw new Error('FRED_API_KEY not configured');
        const { data } = await axios_1.default.get(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${key}&limit=5&sort_order=desc&file_type=json`, { timeout: 8000 });
        const obs = (data?.observations ?? []).find((o) => o.value !== '.' && o.value !== '');
        if (!obs)
            throw new Error('No valid treasury data in FRED response');
        return parseFloat(obs.value);
    }
    async fetchHeadlines() {
        const key = process.env.NEWSAPI_KEY ?? process.env.NEWS_API_KEY;
        if (!key)
            throw new Error('NEWS_API_KEY not configured');
        const { data } = await axios_1.default.get(`https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=5&apiKey=${key}`, { timeout: 8000 });
        return (data?.articles ?? []).slice(0, 5).map((a) => a.title).filter(Boolean);
    }
    async saveSentimentToSupabase(sentiment) {
        const { error } = await this.supabase.db.from('sentiment_cache').upsert({
            id: 1,
            fear_greed: sentiment.fear_greed,
            fear_greed_label: sentiment.fear_greed_label,
            treasury_10y: sentiment.treasury_10y,
            top_headlines: sentiment.top_headlines,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        if (error)
            this.log.warn('Sentiment upsert: ' + error.message);
        else
            this.log.log('Sentiment cached');
    }
    buildFallbackPrices() {
        const fallback = {
            SPY: { price: 524.10, change_1d_pct: 0.42 },
            IVV: { price: 523.80, change_1d_pct: 0.41 },
            VOO: { price: 480.50, change_1d_pct: 0.40 },
            VTI: { price: 254.30, change_1d_pct: 0.38 },
            VXUS: { price: 58.20, change_1d_pct: 0.21 },
            EFA: { price: 76.40, change_1d_pct: 0.18 },
            IWM: { price: 198.70, change_1d_pct: 0.55 },
            QQQ: { price: 445.32, change_1d_pct: 0.87 },
            VGT: { price: 570.10, change_1d_pct: 0.93 },
            XLK: { price: 225.60, change_1d_pct: 0.89 },
            AAPL: { price: 189.30, change_1d_pct: 0.63 },
            MSFT: { price: 378.90, change_1d_pct: 0.72 },
            NVDA: { price: 142.30, change_1d_pct: 1.42 },
            AMZN: { price: 183.20, change_1d_pct: 0.58 },
            GOOGL: { price: 164.50, change_1d_pct: 0.44 },
            META: { price: 490.10, change_1d_pct: 1.05 },
            TSLA: { price: 175.40, change_1d_pct: -1.18 },
            XLF: { price: 42.80, change_1d_pct: 0.33 },
            JPM: { price: 198.60, change_1d_pct: 0.48 },
            V: { price: 273.40, change_1d_pct: 0.29 },
            XLV: { price: 139.20, change_1d_pct: -0.12 },
            JNJ: { price: 147.80, change_1d_pct: -0.08 },
            UNH: { price: 488.30, change_1d_pct: -0.22 },
            XLP: { price: 76.50, change_1d_pct: 0.14 },
            KO: { price: 62.10, change_1d_pct: 0.19 },
            WMT: { price: 68.40, change_1d_pct: 0.31 },
            PG: { price: 162.70, change_1d_pct: 0.11 },
            XLE: { price: 83.20, change_1d_pct: -0.44 },
            SCHD: { price: 77.60, change_1d_pct: 0.26 },
            VYM: { price: 119.80, change_1d_pct: 0.22 },
            VNQ: { price: 91.40, change_1d_pct: 0.22 },
            O: { price: 54.20, change_1d_pct: 0.18 },
            BND: { price: 72.50, change_1d_pct: 0.05 },
            AGG: { price: 98.12, change_1d_pct: 0.08 },
            TLT: { price: 88.30, change_1d_pct: 0.12 },
            SHY: { price: 83.40, change_1d_pct: 0.03 },
            HYG: { price: 76.80, change_1d_pct: 0.07 },
            TIP: { price: 106.20, change_1d_pct: 0.09 },
            GLD: { price: 224.85, change_1d_pct: 0.61 },
            SLV: { price: 28.40, change_1d_pct: 0.74 },
            SGOV: { price: 100.48, change_1d_pct: 0.01 },
            BIL: { price: 91.55, change_1d_pct: 0.01 },
            'BTC-USD': { price: 68420, change_1d_pct: -1.23 },
            'ETH-USD': { price: 3180, change_1d_pct: -0.88 },
            'SOL-USD': { price: 142, change_1d_pct: 0.94 },
        };
        const out = {};
        for (const [ticker, meta] of Object.entries(TICKER_META)) {
            const f = fallback[ticker] ?? { price: 100, change_1d_pct: 0 };
            out[ticker] = { ticker, ...meta, price: f.price, change_1d_pct: f.change_1d_pct, updated_at: new Date().toISOString() };
        }
        return out;
    }
    isStale(updatedAt, ttlMs) {
        if (!updatedAt)
            return true;
        return Date.now() - new Date(updatedAt).getTime() > ttlMs;
    }
};
exports.MarketDataFetcherService = MarketDataFetcherService;
exports.MarketDataFetcherService = MarketDataFetcherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], MarketDataFetcherService);
//# sourceMappingURL=market-data-fetcher.service.js.map