import { useState, useEffect } from 'react';
import * as api from '../services/api';

const STRIP_TICKERS = ['SPY', 'QQQ', 'BTC-USD', 'GLD', 'ETH-USD'];

function PriceChange({ change }: { change: number | null }) {
  if (change === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const color = change > 0 ? 'var(--green)' : change < 0 ? 'var(--red)' : 'var(--text-muted)';
  const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '—';
  return <span style={{ color, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{arrow} {Math.abs(change).toFixed(2)}%</span>;
}

function fearGreedColor(score: number) {
  if (score <= 25) return 'var(--red)';
  if (score <= 45) return '#f97316';
  if (score <= 55) return 'var(--text-secondary)';
  if (score <= 75) return 'var(--green)';
  return '#86efac';
}

export default function LiveStrip() {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [sentiment, setSentiment] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  async function refresh() {
    try {
      const [p, s] = await Promise.all([api.getPrices(), api.getSentiment()]);
      setPrices(p);
      setSentiment(s);
      setLastUpdate(new Date());
    } catch { /* ignore */ }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60000);
    return () => clearInterval(id);
  }, []);

  const minAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 60000);

  return (
    <div style={{
      height: 48,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 32,
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {STRIP_TICKERS.map(ticker => {
        const p = prices[ticker];
        return (
          <div key={ticker} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{ticker}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-primary)' }}>
              {p ? p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
            </span>
            <PriceChange change={p?.change_1d_pct ?? null} />
          </div>
        );
      })}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {sentiment && (
          <span style={{ fontSize: 12, color: fearGreedColor(sentiment.fear_greed), fontWeight: 600 }}>
            F&amp;G: {sentiment.fear_greed} {sentiment.fear_greed_label}
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Updated {minAgo === 0 ? 'just now' : `${minAgo}m ago`}
        </span>
      </div>
    </div>
  );
}
