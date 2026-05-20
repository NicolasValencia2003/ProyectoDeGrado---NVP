import { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import type { HistoryEntry } from '../types';

function fearGreedColor(score: number) {
  if (score <= 25) return 'var(--red)';
  if (score <= 45) return '#f97316';
  if (score <= 55) return 'var(--text-secondary)';
  if (score <= 75) return 'var(--green)';
  return '#86efac';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then(setHistory).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: 48 }}>
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 32px' }}>
        Recommendation History
      </h1>

      {loading && (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading history...</div>
      )}

      {!loading && history.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your recommendations will appear here after your first session.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {history.map(entry => (
          <div key={entry.id} className="card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--text-primary)', margin: 0 }}>
                {formatDate(entry.created_at)}
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Risk score: {entry.risk_score_used}/10
                </span>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', color: fearGreedColor(entry.market_snapshot.fear_greed) }}>
                  F&amp;G: {entry.market_snapshot.fear_greed} ({entry.market_snapshot.fear_greed_label})
                </span>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  10Y: {entry.market_snapshot.treasury_10y}%
                </span>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Asset', 'Allocation', 'Price then', 'Price now', 'Performance'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entry.payload.recommendations.map(rec => {
                    const perf = rec.performance_pct;
                    const perfColor = perf === null ? 'var(--text-muted)' : perf > 0 ? 'var(--green)' : perf < 0 ? 'var(--red)' : 'var(--text-muted)';
                    const perfArrow = perf === null ? '' : perf > 0 ? '▲' : perf < 0 ? '▼' : '';
                    return (
                      <tr key={rec.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                          {rec.ticker}
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8, fontSize: 12 }}>{rec.name}</span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{rec.allocation_pct}%</td>
                        <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                          ${(rec as any).price_at_rec?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                          ${rec.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', color: perfColor, fontWeight: 600 }}>
                          {perf !== null ? `${perfArrow} ${Math.abs(perf).toFixed(2)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 12, margin: '12px 0 0' }}>
              {entry.payload.market_summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
