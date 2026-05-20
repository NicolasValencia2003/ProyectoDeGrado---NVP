import { useEffect, useRef, useState } from 'react';
import { useEventLogger } from '../hooks/useEventLogger';
import type { RecommendationItem } from '../types';

const ASSET_CLASS_COLORS: Record<string, string> = {
  etf:       '#3b82f6',
  stock:     '#8b5cf6',
  bond:      '#10b981',
  crypto:    '#f59e0b',
  commodity: '#d4a843',
  reit:      '#ec4899',
  cash:      '#6b7280',
};

interface Props {
  item: RecommendationItem & { key_concept?: string; educational_insight?: string };
  index: number;
  onReplace?: (ticker: string) => void;
  replacing?: boolean;
}

function useBriefFeedback() {
  const [msg, setMsg] = useState('');
  const show = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 1800);
  };
  return [msg, show] as const;
}

export default function RecommendationCard({ item, index, onReplace, replacing }: Props) {
  const logEvent   = useEventLogger();
  const mountTime  = useRef(Date.now());
  const [saved, setSaved]       = useState(false);
  const [liked, setLiked]       = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [alloc, setAlloc]       = useState(0);
  const [showTip, setShowTip]   = useState(false);
  const [feedback, showFeedback] = useBriefFeedback();

  useEffect(() => {
    logEvent('view', { ticker: item.ticker, asset_class: item.asset_class, sector: item.sector });
    const t = setTimeout(() => setAlloc(item.allocation_pct), 100 + index * 80);
    return () => {
      clearTimeout(t);
      const elapsed = Math.round((Date.now() - mountTime.current) / 1000);
      logEvent('dwell', { ticker: item.ticker, asset_class: item.asset_class, sector: item.sector }, { dwell_seconds: elapsed });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading skeleton while replacement is being fetched
  if (replacing) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.6 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⟳</div>
          Buscando alternativa...
        </div>
      </div>
    );
  }

  const priceColor = item.change_1d_pct === null ? 'var(--text-muted)'
    : item.change_1d_pct > 0 ? 'var(--green)' : item.change_1d_pct < 0 ? 'var(--red)' : 'var(--text-muted)';
  const priceArrow = item.change_1d_pct === null || item.change_1d_pct === 0 ? ''
    : item.change_1d_pct > 0 ? '▲' : '▼';
  const changeLabel = item.change_1d_pct === null ? '—' : `${Math.abs(item.change_1d_pct).toFixed(2)}%`;

  const keyRiskText = item.key_risk ?? item.key_concept ?? '';

  function handleSave() {
    const next = !saved;
    setSaved(next);
    showFeedback(next ? 'Guardado en tu referencia ✓' : 'Eliminado de guardados');
    logEvent('save', { ticker: item.ticker, asset_class: item.asset_class, sector: item.sector });
  }

  function handleLike() {
    setLiked(true);
    setDisliked(false);
    showFeedback('Tenido en cuenta para futuras recomendaciones 👍');
    logEvent('rate_up', { ticker: item.ticker, asset_class: item.asset_class, sector: item.sector });
  }

  function handleDislike() {
    setDisliked(true);
    setLiked(false);
    showFeedback('Anotado — no volverá a priorizarse 👎');
    logEvent('rate_down', { ticker: item.ticker, asset_class: item.asset_class, sector: item.sector });
  }

  function handleReplace() {
    logEvent('dismiss', { ticker: item.ticker, asset_class: item.asset_class, sector: item.sector });
    onReplace?.(item.ticker);
  }

  return (
    <div
      className="card fade-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both', position: 'relative' }}
    >
      {/* Educational badge */}
      <div style={{
        position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 600,
        padding: '2px 8px', borderRadius: 4,
        background: 'rgba(59,130,246,0.12)', color: 'var(--blue)', letterSpacing: '0.05em',
      }}>
        📚 Material educativo
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingRight: 110 }}>
        <div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginRight: 10 }}>
            {item.ticker}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.name}</span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
          background: `${ASSET_CLASS_COLORS[item.asset_class] || '#6b7280'}22`,
          color: ASSET_CLASS_COLORS[item.asset_class] || '#6b7280',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {item.asset_class}
        </span>
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
          ${item.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: priceColor }}>
          {priceArrow} {changeLabel}
        </span>
      </div>

      {/* Allocation bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Peso educativo sugerido</span>
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              style={{ background: 'none', border: 'none', cursor: 'help', fontSize: 11, color: 'var(--text-muted)', padding: 0 }}
            >
              ⓘ
            </button>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{item.allocation_pct}%</span>
        </div>
        {showTip && (
          <div style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
            Porcentaje ilustrativo de cómo encajaría este activo en un portafolio para tu perfil. No es una recomendación de inversión real.
          </div>
        )}
        <div style={{ height: 6, background: 'var(--bg-surface-raised)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${alloc}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 3, transition: 'width 600ms ease-out' }} />
        </div>
      </div>

      {/* Rationale */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Por qué es relevante para tu perfil:
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {item.rationale}
        </p>
      </div>

      {/* Key risk */}
      {keyRiskText && (
        <div style={{ borderLeft: '3px solid var(--amber)', background: 'var(--amber-dim)', borderRadius: '0 6px 6px 0', padding: '10px 12px', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ⚠ Concepto clave de riesgo
          </span>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>{keyRiskText}</p>
        </div>
      )}

      {/* Educational insight */}
      {item.educational_insight && (
        <div style={{ borderLeft: '3px solid var(--blue)', background: 'var(--blue-dim)', borderRadius: '0 6px 6px 0', padding: '10px 12px', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            💡 Perspectiva educativa
          </span>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>{item.educational_insight}</p>
        </div>
      )}

      {/* Inline feedback message */}
      {feedback && (
        <div style={{
          fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-surface-raised)',
          borderRadius: 6, padding: '6px 12px', marginBottom: 10, textAlign: 'center',
          animation: 'fadeIn 150ms ease',
        }}>
          {feedback}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Save */}
        <button
          title={saved ? 'Guardado ✓' : 'Guardar activo'}
          onClick={handleSave}
          style={{
            background: saved ? 'rgba(212,168,67,0.15)' : 'var(--bg-surface-raised)',
            border: `1px solid ${saved ? 'var(--gold)' : 'var(--border)'}`,
            borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
            fontSize: 16, color: saved ? 'var(--gold)' : 'var(--text-muted)',
            transition: 'all 150ms ease',
          }}
        >
          {saved ? '★' : '☆'}
        </button>

        {/* Like */}
        <button
          title="Me ayudó a entender"
          onClick={handleLike}
          style={{
            background: liked ? 'rgba(16,185,129,0.12)' : 'var(--bg-surface-raised)',
            border: `1px solid ${liked ? 'var(--green)' : 'var(--border)'}`,
            borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
            fontSize: 14, transition: 'all 150ms ease',
          }}
        >
          👍
        </button>

        {/* Dislike */}
        <button
          title="No es para mi perfil"
          onClick={handleDislike}
          style={{
            background: disliked ? 'rgba(239,68,68,0.10)' : 'var(--bg-surface-raised)',
            border: `1px solid ${disliked ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
            fontSize: 14, transition: 'all 150ms ease',
          }}
        >
          👎
        </button>

        {/* Replace */}
        <button
          title="Reemplazar por otro activo"
          onClick={handleReplace}
          style={{
            background: 'var(--bg-surface-raised)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
            fontSize: 14, color: 'var(--text-muted)', transition: 'all 150ms ease',
          }}
        >
          ↺
        </button>
      </div>
    </div>
  );
}
