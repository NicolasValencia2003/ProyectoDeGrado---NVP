import { useState } from 'react';
import { logEvent } from '../services/api';

interface Props {
  biasType: string;
  message: string;
  strength: number;
  exampleTickers?: string[];
  // Enrichments from behavioral detection engine
  intervention?: string;
  tip?: string;
  evidence?: string;
  icon?: string;
}

export default function BiasAlert({ biasType, message, strength, exampleTickers = [], intervention, tip, evidence, icon }: Props) {
  const [dismissed, setDismissed]         = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [expanded, setExpanded]           = useState(false);

  if (dismissed) return null;

  async function handleAcknowledge() {
    setAcknowledging(true);
    logEvent({
      event_type:   'bias_acknowledged' as any,
      asset_ticker: biasType,
      asset_class:  'bias',
      sector:       'cognitive',
    }).catch(() => {});
    setTimeout(() => setDismissed(true), 300);
  }

  return (
    <div style={{
      border: '1px solid var(--amber)',
      borderLeftWidth: 4,
      borderRadius: '0 12px 12px 0',
      background: 'rgba(245,158,11,0.05)',
      padding: '20px 24px',
      marginTop: 24,
      opacity: acknowledging ? 0 : 1,
      transform: acknowledging ? 'translateY(8px)' : 'none',
      transition: 'all 300ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{icon ?? '🧠'}</span>
        <div style={{ flex: 1 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Sesgo cognitivo detectado · Motor conductual FinVise
              </span>
              <h4 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {message}
              </h4>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
              Intensidad: {Math.round(strength * 100)}%
            </span>
          </div>

          {/* Evidence pill — shows what triggered the detection */}
          {evidence && (
            <div style={{ fontSize: 12, color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', borderRadius: 6, padding: '6px 12px', marginBottom: 12, lineHeight: 1.5 }}>
              📊 {evidence}
            </div>
          )}

          {exampleTickers.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {exampleTickers.map(t => (
                <span key={t} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: 'var(--amber)' }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Expandable educational intervention */}
          {(intervention || tip) && (
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setExpanded(e => !e)}
                style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif' }}
              >
                {expanded ? '▲ Ocultar' : '▼ Ver'} intervención educativa
              </button>
              {expanded && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {intervention && (
                    <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>¿Qué dice la evidencia?</div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{intervention}</p>
                    </div>
                  )}
                  {tip && (
                    <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💡 Contramedida práctica</div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{tip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={handleAcknowledge} style={{
              background: 'var(--amber)', border: 'none', borderRadius: 6,
              padding: '6px 16px', fontSize: 12, fontWeight: 600,
              color: '#0a0f1e', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              marginLeft: 'auto',
            }}>
              Entendido ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
