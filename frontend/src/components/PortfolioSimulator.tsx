import { useState, useEffect, useRef } from 'react';
import type { Recommendation } from '../types';
import { logBehaviorEvent } from '../services/api';

interface Props {
  data: Recommendation;
}

const AMOUNTS = [
  { label: '$500.000 COP',   value: 500_000 },
  { label: '$1.000.000 COP', value: 1_000_000 },
  { label: '$5.000.000 COP', value: 5_000_000 },
  { label: '$10.000.000 COP',value: 10_000_000 },
];

function fmt(n: number) {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

export default function PortfolioSimulator({ data }: Props) {
  const [amount, setAmount] = useState(1_000_000);
  const [custom, setCustom] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const loggedRef = useRef(false);

  const capital = useCustom ? (parseInt(custom.replace(/\D/g, '')) || 0) : amount;

  const items = data.recommendations.map(rec => {
    const alloc     = rec.allocation_pct / 100;
    const invested  = capital * alloc;
    const changePct = rec.change_1d_pct;          // null = no hay dato real
    const gainLoss  = changePct !== null ? invested * (changePct / 100) : null;
    return { ...rec, invested, gainLoss, changePct };
  });

  const itemsWithData  = items.filter(i => i.gainLoss !== null);
  const totalGainLoss  = itemsWithData.reduce((s, i) => s + (i.gainLoss ?? 0), 0);
  const capitalWithData = itemsWithData.reduce((s, i) => s + i.invested, 0);
  const totalPct       = capitalWithData > 0 ? (totalGainLoss / capitalWithData) * 100 : 0;
  const isPositive     = totalGainLoss >= 0;
  const hasPartialData = itemsWithData.length > 0 && itemsWithData.length < items.length;
  const hasNoData      = itemsWithData.length === 0;

  // Log simulator_used once per mount with result direction for loss-aversion detection
  useEffect(() => {
    if (loggedRef.current || capital === 0 || items.length === 0) return;
    loggedRef.current = true;
    logBehaviorEvent('simulator_used', {
      metadata: { result_pct: Math.round(totalPct * 100) / 100, amount: capital },
    });
  }, [items.length]);

  return (
    <div className="card" style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            🧮 Simulador hipotético
          </div>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
            ¿Qué habría pasado ayer con este portafolio?
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Simulación basada en variaciones del día anterior · Solo educativo
          </p>
        </div>
        <div style={{
          textAlign: 'right', padding: '12px 20px', borderRadius: 10,
          background: hasNoData ? 'var(--bg-surface-raised)' : isPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${hasNoData ? 'var(--border)' : isPositive ? 'var(--green)' : 'var(--red)'}40`,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
            {hasNoData ? 'Sin datos en tiempo real' : hasPartialData ? `Resultado parcial (${itemsWithData.length}/${items.length} activos)` : 'Resultado simulado'}
          </div>
          {hasNoData ? (
            <div style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>Esperando precios reales</div>
          ) : (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: isPositive ? 'var(--green)' : 'var(--red)' }}>
                {isPositive ? '+' : ''}{fmt(totalGainLoss)}
              </div>
              <div style={{ fontSize: 12, color: isPositive ? 'var(--green)' : 'var(--red)', fontFamily: 'JetBrains Mono, monospace' }}>
                {isPositive ? '+' : ''}{totalPct.toFixed(2)}% en 1 día
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amount selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Capital simulado:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {AMOUNTS.map(a => (
            <button
              key={a.value}
              onClick={() => { setAmount(a.value); setUseCustom(false); }}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', border: '1px solid var(--border)',
                background: (!useCustom && amount === a.value) ? 'var(--gold)' : 'transparent',
                color: (!useCustom && amount === a.value) ? '#0a0f1e' : 'var(--text-secondary)',
                transition: 'all 150ms',
              }}
            >
              {a.label}
            </button>
          ))}
          <button
            onClick={() => setUseCustom(true)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', border: '1px solid var(--border)',
              background: useCustom ? 'var(--gold)' : 'transparent',
              color: useCustom ? '#0a0f1e' : 'var(--text-secondary)',
            }}
          >
            Personalizado
          </button>
        </div>
        {useCustom && (
          <input
            type="text"
            placeholder="Ej: 2500000"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid var(--gold)',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              fontSize: 14, fontFamily: 'JetBrains Mono, monospace', width: 180,
              outline: 'none',
            }}
          />
        )}
      </div>

      {/* Asset breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => {
          const hasPrice = item.gainLoss !== null;
          const gl       = item.gainLoss ?? 0;
          const pct      = item.changePct;
          const glColor  = !hasPrice ? 'var(--text-muted)' : gl >= 0 ? 'var(--green)' : 'var(--red)';
          return (
            <div key={item.ticker} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              background: 'var(--bg-surface-raised)', borderRadius: 8, flexWrap: 'wrap',
              opacity: hasPrice ? 1 : 0.55,
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', width: 72, flexShrink: 0 }}>
                {item.ticker}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1, minWidth: 100 }}>
                {item.allocation_pct}% · {fmt(item.invested)}
              </span>
              <div style={{ textAlign: 'right' }}>
                {hasPrice ? (
                  <>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: glColor }}>
                      {gl >= 0 ? '+' : ''}{fmt(gl)}
                    </span>
                    <span style={{ fontSize: 11, color: glColor, marginLeft: 8 }}>
                      ({pct! >= 0 ? '+' : ''}{pct!.toFixed(2)}%)
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin dato real</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasPartialData && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          Los activos atenuados no tienen precio en tiempo real — el resultado parcial excluye su variación.
        </div>
      )}

      <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, border: '1px solid var(--amber)30' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          ⚠️ <strong>Solo educativo:</strong> Esta simulación usa variaciones del día anterior para ilustrar conceptos de asignación de activos.
          No predice rendimientos futuros ni constituye asesoramiento financiero.
          Los valores están expresados en COP como referencia pedagógica.
        </p>
      </div>
    </div>
  );
}
