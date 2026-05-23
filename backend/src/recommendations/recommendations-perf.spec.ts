import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { SupabaseService } from '../supabase/supabase.service';
import { MarketDataFetcherService } from '../market/market-data-fetcher.service';
import { BanditService } from '../bandit/bandit.service';

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const MOCK_PRICES: Record<string, any> = {
  SPY:  { price: 500, change_1d_pct: 0.5,  asset_class: 'etf',       sector: 'broad_market', risk_level: 5, name: 'S&P 500 ETF' },
  QQQ:  { price: 450, change_1d_pct: 0.8,  asset_class: 'etf',       sector: 'technology',   risk_level: 7, name: 'Nasdaq 100 ETF' },
  BND:  { price: 75,  change_1d_pct: -0.1, asset_class: 'bond',      sector: 'bonds',        risk_level: 2, name: 'Bonos Total EE.UU.' },
  AGG:  { price: 98,  change_1d_pct: -0.2, asset_class: 'bond',      sector: 'bonds',        risk_level: 2, name: 'iShares Bonos Totales' },
  GLD:  { price: 200, change_1d_pct: 0.2,  asset_class: 'commodity', sector: 'commodities',  risk_level: 4, name: 'ETF de Oro SPDR' },
  VNQ:  { price: 90,  change_1d_pct: 0.0,  asset_class: 'reit',      sector: 'real_estate',  risk_level: 5, name: 'REIT Vanguard' },
  SGOV: { price: 100, change_1d_pct: 0.01, asset_class: 'cash',      sector: 'cash',         risk_level: 1, name: 'Letras del Tesoro 3M' },
  AAPL: { price: 200, change_1d_pct: 1.2,  asset_class: 'stock',     sector: 'technology',   risk_level: 6, name: 'Apple Inc.' },
  MSFT: { price: 420, change_1d_pct: 0.9,  asset_class: 'stock',     sector: 'technology',   risk_level: 6, name: 'Microsoft Corp.' },
};

const MOCK_SENTIMENT = {
  fear_greed: 55, fear_greed_label: 'Neutral', treasury_10y: 4.42,
  top_headlines: [{ title: 'Markets remain steady' }],
};

const MOCK_CLAUDE_RESPONSE = {
  content: [{
    type: 'text',
    text: JSON.stringify({
      recommendations: [
        { ticker: 'SPY', name: 'S&P 500 ETF', allocation_pct: 40, rationale: 'Ejemplo educativo.', key_concept: 'Riesgo de mercado.', asset_class: 'etf', sector: 'broad_market' },
        { ticker: 'BND', name: 'Bonos Total', allocation_pct: 25, rationale: 'Estabilidad educativa.', key_concept: 'Riesgo de tasa de interés.', asset_class: 'bond', sector: 'bonds' },
      ],
      market_summary: 'Mercado estable hoy.',
      educational_insight: 'La diversificación reduce el riesgo total.',
      disclaimer: 'Material educativo FinVise — Pontificia Universidad Javeriana Cali.',
    }),
  }],
};

const MOCK_USER = { id: 'test-user-perf', risk_score: 5, excluded_sectors: [] };

// ─── Utilidades ───────────────────────────────────────────────────────────────

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx    = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('9.3 Pruebas de Rendimiento — Recomendaciones (RNF-01)', () => {
  let service: RecommendationsService;
  let mockAnthropicCreate: jest.Mock;
  let mockGetPrices: jest.Mock;
  let mockGetSentiment: jest.Mock;
  let mockGetScores: jest.Mock;

  beforeAll(async () => {
    mockAnthropicCreate  = jest.fn().mockResolvedValue(MOCK_CLAUDE_RESPONSE);
    mockGetPrices        = jest.fn().mockResolvedValue(MOCK_PRICES);
    mockGetSentiment     = jest.fn().mockResolvedValue(MOCK_SENTIMENT);
    mockGetScores        = jest.fn().mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: SupabaseService,          useValue: { isConfigured: () => false } },
        { provide: MarketDataFetcherService, useValue: { getPricesWithRefresh: mockGetPrices, getSentimentWithRefresh: mockGetSentiment } },
        { provide: BanditService,            useValue: { getScores: mockGetScores, rank: (t: string[]) => t } },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    // Inyectar cliente Anthropic simulado (evita llamada real a la API)
    (service as any).anthropic = { messages: { create: mockAnthropicCreate } };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAnthropicCreate.mockResolvedValue(MOCK_CLAUDE_RESPONSE);
    mockGetPrices.mockResolvedValue(MOCK_PRICES);
    mockGetSentiment.mockResolvedValue(MOCK_SENTIMENT);
    mockGetScores.mockResolvedValue({});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Prueba 1a: p95 < 35 s ──────────────────────────────────────────────────
  it('p95 de 100 solicitudes secuenciales < 35 000 ms', async () => {
    const times: number[] = [];

    for (let i = 0; i < 100; i++) {
      const t0 = Date.now();
      await service.generate(MOCK_USER);
      times.push(Date.now() - t0);
    }

    const p50 = percentile(times, 50);
    const p95 = percentile(times, 95);
    const max = Math.max(...times);
    const min = Math.min(...times);

    console.log('\n  ┌─ Resultados de latencia (100 solicitudes secuenciales) ─────────');
    console.log(`  │  mín: ${min} ms  |  p50: ${p50} ms  |  p95: ${p95} ms  |  máx: ${max} ms`);
    console.log('  └──────────────────────────────────────────────────────────────────');

    expect(p95).toBeLessThan(35_000);
  }, 120_000);

  // ── Prueba 1b: timeout market data (10 s) ─────────────────────────────────
  it('timeout market data 10 s: generate() retorna respuesta válida con precios vacíos', async () => {
    jest.useFakeTimers();

    // Simular datos de mercado que tardan 11 s (supera el umbral de 10 s)
    mockGetPrices.mockReturnValueOnce(
      new Promise(r => setTimeout(() => r({ SPY: { price: 999 } }), 11_000)),
    );

    const promise = service.generate(MOCK_USER);
    await jest.advanceTimersByTimeAsync(25_000);
    const result = await promise;

    expect(result).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);

    console.log(`\n  Timeout market data (10 s): respuesta recibida con ${result.recommendations.length} recomendaciones`);
  }, 60_000);

  // ── Prueba 1c: timeout UCB1 (5 s) ─────────────────────────────────────────
  it('timeout UCB1 5 s: generate() retorna respuesta válida con scores vacíos', async () => {
    jest.useFakeTimers();

    // Simular algoritmo bandit que tarda 6 s (supera el umbral de 5 s)
    mockGetScores.mockReturnValueOnce(
      new Promise(r => setTimeout(() => r({ SPY: 1.5 }), 6_000)),
    );

    const promise = service.generate(MOCK_USER);
    await jest.advanceTimersByTimeAsync(25_000);
    const result = await promise;

    expect(result).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);

    console.log(`\n  Timeout UCB1 (5 s): respuesta recibida con ${result.recommendations.length} recomendaciones`);
  }, 60_000);

  // ── Prueba 1d: timeout Claude API (20 s) ──────────────────────────────────
  it('timeout Claude API 20 s: generate() retorna candidatos pre-computados sin esperar respuesta de IA', async () => {
    jest.useFakeTimers();

    // Claude nunca responde → el Promise.race dispara el timeout a los 20 s
    mockAnthropicCreate.mockReturnValueOnce(new Promise(() => {}));

    const promise = service.generate(MOCK_USER);
    await jest.advanceTimersByTimeAsync(30_000);
    const result = await promise;

    // La rama fallback devuelve los candidatos pre-computados
    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);

    console.log(`\n  Timeout Claude (20 s): respuesta fallback con ${result.recommendations.length} recomendaciones pre-computadas`);
  }, 60_000);
});
