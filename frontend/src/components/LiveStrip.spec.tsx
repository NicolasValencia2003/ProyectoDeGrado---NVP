import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LiveStrip from './LiveStrip';

// ─── Mock del módulo de API ───────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  getPrices:    vi.fn().mockResolvedValue({}),
  getSentiment: vi.fn().mockResolvedValue(null),
}));

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('9.3 Pruebas de Rendimiento — Actualización Tira de Precios (60 s)', () => {
  let getPricesMock:    ReturnType<typeof vi.fn>;
  let getSentimentMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers();

    // Importar los mocks ya instanciados por vi.mock
    const api = await import('../services/api');
    getPricesMock    = api.getPrices    as unknown as ReturnType<typeof vi.fn>;
    getSentimentMock = api.getSentiment as unknown as ReturnType<typeof vi.fn>;

    getPricesMock.mockResolvedValue({
      SPY:      { price: 500,   change_1d_pct: 0.5  },
      QQQ:      { price: 450,   change_1d_pct: 0.8  },
      'BTC-USD':{ price: 95000, change_1d_pct: 1.2  },
      GLD:      { price: 200,   change_1d_pct: 0.2  },
      'ETH-USD':{ price: 3200,  change_1d_pct: -0.3 },
    });
    getSentimentMock.mockResolvedValue({ fear_greed: 55, fear_greed_label: 'Neutral' });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── Prueba 3a: carga inicial ───────────────────────────────────────────────
  it('llama a la API de precios al montar el componente', async () => {
    await act(async () => {
      render(<LiveStrip />);
      await vi.runAllTimersAsync();
    });

    expect(getPricesMock).toHaveBeenCalledTimes(1);
    expect(getSentimentMock).toHaveBeenCalledTimes(1);

    console.log('\n  Carga inicial: getPrices() y getSentiment() llamadas al montar ✓');
  });

  // ── Prueba 3b: refresco automático cada 60 s ───────────────────────────────
  it('configura setInterval con intervalo de 60 000 ms', async () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    await act(async () => {
      render(<LiveStrip />);
      await vi.runAllTimersAsync();
    });

    const call = setIntervalSpy.mock.calls.find(([, delay]) => delay === 60_000);

    console.log(`\n  setInterval registrado: ${call ? `delay = ${call[1]} ms ✓` : 'no encontrado ✗'}`);
    expect(call).toBeDefined();
    expect(call![1]).toBe(60_000);
  });

  // ── Prueba 3c: segunda actualización a los 60 s ────────────────────────────
  it('refresca los precios automáticamente después de 60 s', async () => {
    await act(async () => {
      render(<LiveStrip />);
      await vi.runAllTimersAsync();
    });

    const callsAfterMount = getPricesMock.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThanOrEqual(1);

    // Avanzar exactamente 60 segundos
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    const callsAfter60s = getPricesMock.mock.calls.length;

    console.log(`\n  ┌─ Polling tira de precios ───────────────────────────`);
    console.log(`  │  Llamadas al montar:        ${callsAfterMount}`);
    console.log(`  │  Llamadas tras 60 s:        ${callsAfter60s}`);
    console.log(`  │  Llamadas adicionales:      ${callsAfter60s - callsAfterMount}`);
    console.log('  └──────────────────────────────────────────────────────');

    expect(callsAfter60s).toBeGreaterThan(callsAfterMount);
  });

  // ── Prueba 3d: limpieza del intervalo al desmontar ─────────────────────────
  it('cancela el intervalo de polling al desmontar el componente', async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    let unmount: () => void;
    await act(async () => {
      const rendered = render(<LiveStrip />);
      unmount = rendered.unmount;
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      unmount();
    });

    console.log(`\n  clearInterval llamado al desmontar: ${clearIntervalSpy.mock.calls.length > 0 ? 'sí ✓' : 'no ✗'}`);
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
