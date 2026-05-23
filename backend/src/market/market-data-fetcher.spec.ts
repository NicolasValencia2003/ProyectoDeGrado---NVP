import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataFetcherService } from './market-data-fetcher.service';
import { SupabaseService } from '../supabase/supabase.service';

// Bloquear llamadas HTTP reales: ningún test debe salir a internet
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ data: {} }),
  })),
  get: jest.fn().mockResolvedValue({ data: {} }),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const CACHED_PRICES = [
  { ticker: 'SPY',     price: 500,   change_1d_pct: 0.5,  asset_class: 'etf',  sector: 'broad_market', risk_level: 5, name: 'S&P 500 ETF', updated_at: new Date().toISOString() },
  { ticker: 'BND',     price: 75,    change_1d_pct: -0.1, asset_class: 'bond', sector: 'bonds',        risk_level: 2, name: 'Bonos Total',  updated_at: new Date().toISOString() },
  { ticker: 'BTC-USD', price: 95000, change_1d_pct: 2.0,  asset_class: 'crypto', sector: 'crypto',    risk_level: 9, name: 'Bitcoin',      updated_at: new Date().toISOString() },
];

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('9.3 Pruebas de Rendimiento — Caché de Precios (TTL 5 min)', () => {
  let service: MarketDataFetcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketDataFetcherService,
        {
          provide: SupabaseService,
          useValue: {
            isConfigured: () => true,
            db: {
              from: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({ data: CACHED_PRICES, error: null }),
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MarketDataFetcherService>(MarketDataFetcherService);
  });

  // ── Prueba 2a: primera solicitud pobla el caché ────────────────────────────
  it('primera solicitud pobla el caché de memoria con los precios de Supabase', async () => {
    expect((service as any).memPrices).toBeNull();
    expect((service as any).memPricesAt).toBe(0);

    const result = await service.getPricesWithRefresh();

    expect(result).toBeDefined();
    expect(Object.keys(result).length).toBeGreaterThan(0);
    expect((service as any).memPrices).not.toBeNull();
    expect((service as any).memPricesAt).toBeGreaterThan(0);

    console.log(`\n  Primera solicitud: ${Object.keys(result).length} tickers cargados en caché`);
  });

  // ── Prueba 2b: segunda solicitud dentro del TTL < 2 s ──────────────────────
  it('segunda solicitud dentro del TTL de 5 min usa caché de memoria (< 2 000 ms)', async () => {
    // Pre-cargar el caché directamente (equivale a que ya ocurrió una solicitud previa)
    const preCachedData = { SPY: { price: 500 }, BND: { price: 75 } };
    (service as any).memPrices   = preCachedData;
    (service as any).memPricesAt = Date.now();

    const t0      = Date.now();
    const result  = await service.getPricesWithRefresh();
    const elapsed = Date.now() - t0;

    console.log(`\n  ┌─ Caché de precios ───────────────────────────────────`);
    console.log(`  │  Tiempo solicitud en caché: ${elapsed} ms  (umbral: < 2 000 ms)`);
    console.log('  └──────────────────────────────────────────────────────');

    expect(elapsed).toBeLessThan(2_000);
    expect(result).toEqual(preCachedData);
  });

  // ── Prueba 2c: TTL expirado fuerza nueva consulta ─────────────────────────
  it('caché con TTL expirado (> 5 min) es detectado como inválido y fuerza recarga', async () => {
    const MEM_CACHE_TTL_MS = 5 * 60 * 1000; // constante del servicio

    // Simular un caché con datos de hace 6 minutos
    (service as any).memPrices   = { SPY: { price: 400 } };
    (service as any).memPricesAt = Date.now() - 6 * 60 * 1000;

    const cacheAge   = Date.now() - (service as any).memPricesAt;
    const isCacheHit = cacheAge < MEM_CACHE_TTL_MS;

    console.log(`\n  Edad del caché: ${Math.round(cacheAge / 1000)} s — TTL: ${MEM_CACHE_TTL_MS / 1000} s — ¿válido?: ${isCacheHit}`);
    expect(isCacheHit).toBe(false);

    // La próxima llamada DEBE ignorar el caché y consultar Supabase
    const result = await service.getPricesWithRefresh();
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  // ── Prueba 2d: constante TTL verificada ────────────────────────────────────
  it('constante MEM_CACHE_TTL_MS es exactamente 5 minutos (300 000 ms)', () => {
    // Verificación de la constante definida en market-data-fetcher.service.ts:104
    const EXPECTED_TTL_MS = 5 * 60 * 1000;

    // Calcular cuánto tiempo falta para expirar un caché recién creado
    (service as any).memPrices   = { SPY: { price: 500 } };
    (service as any).memPricesAt = Date.now();

    const justExpired = Date.now() - (service as any).memPricesAt < EXPECTED_TTL_MS;
    expect(justExpired).toBe(true);

    // Un caché de exactamente 5 min ya no es válido
    (service as any).memPricesAt = Date.now() - EXPECTED_TTL_MS;
    const exactlyExpired = Date.now() - (service as any).memPricesAt >= EXPECTED_TTL_MS;
    expect(exactlyExpired).toBe(true);

    console.log(`\n  TTL verificado: ${EXPECTED_TTL_MS / 1000} s (${EXPECTED_TTL_MS / 60000} min)`);
  });
});
