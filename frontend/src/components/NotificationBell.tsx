import { useState, useEffect, useRef } from 'react';
import { getAlerts, markAlertRead } from '../services/api';
import type { MarketAlert } from '../types';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const SEVERITY_COLOR: Record<string, string> = {
  info: 'var(--blue)',
  warning: 'var(--amber)',
  danger: 'var(--red)',
};

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = alerts.filter(a => !a.read_by.includes('mock-user-001'));

  async function handleOpen() {
    setOpen(!open);
    if (!open) {
      for (const alert of unread) {
        try { await markAlertRead(alert.id); } catch { /* ignore */ }
      }
      setAlerts(prev => prev.map(a => ({ ...a, read_by: [...new Set([...a.read_by, 'mock-user-001'])] })));
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 10px',
          cursor: 'pointer',
          position: 'relative',
          fontSize: 16,
          color: 'var(--text-primary)',
        }}
      >
        🔔
        {unread.length > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'var(--red)',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 10,
            minWidth: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}>
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 44,
          width: 360,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Alerts
          </div>
          {alerts.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No alerts</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: SEVERITY_COLOR[alert.severity], fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                  {alert.severity === 'warning' ? '⚠' : alert.severity === 'danger' ? '🔴' : 'ℹ'}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.5 }}>{alert.message}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(alert.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
