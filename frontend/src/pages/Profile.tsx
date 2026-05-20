import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_USER = {
  id: 'mock-user-001',
  email: 'demo@example.com',
  risk_score: parseInt(typeof window !== 'undefined' ? localStorage.getItem('risk_score') || '7' : '7', 10),
  monthly_budget: 2000,
  horizon: '5-10y',
  excluded_sectors: [] as string[],
  email_alerts: true,
  event_count: 14,
};

const PROFILE_NAMES: Record<string, string> = {
  '1': 'Conservative', '2': 'Conservative', '3': 'Conservative',
  '4': 'Balanced', '5': 'Balanced', '6': 'Balanced',
  '7': 'Growth', '8': 'Growth',
  '9': 'Aggressive', '10': 'Aggressive',
};

export default function Profile() {
  const navigate = useNavigate();
  const riskScore = parseInt(localStorage.getItem('risk_score') || '7', 10);
  const [budget, setBudget] = useState(MOCK_USER.monthly_budget);
  const [horizon, setHorizon] = useState(MOCK_USER.horizon);
  const [excluded, setExcluded] = useState<string[]>(MOCK_USER.excluded_sectors);
  const [emailAlerts, setEmailAlerts] = useState(MOCK_USER.email_alerts);
  const [saved, setSaved] = useState(false);

  const SECTORS = ['energy', 'crypto', 'tobacco', 'weapons'];

  function toggleSector(s: string) {
    setExcluded(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const profileName = PROFILE_NAMES[String(riskScore)] || 'Balanced';

  return (
    <div style={{ paddingBottom: 48, maxWidth: 640 }}>
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 32px' }}>
        Your Profile
      </h1>

      {/* Risk Score */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Profile</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 48, color: 'var(--gold)', lineHeight: 1 }}>{riskScore}</span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>/ 10</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{profileName} Investor</div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/onboarding')} style={{ fontSize: 13 }}>
          Retake quiz
        </button>
      </div>

      {/* Personalization */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Personalization</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>14 interactions recorded</span>
          <span style={{ color: 'var(--text-muted)' }}>14 / 20</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-surface-raised)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(14 / 20) * 100}%`, background: 'var(--gold)', borderRadius: 3 }} />
        </div>
      </div>

      {/* Settings */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>Preferences</h2>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Budget</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '6px 0 0 6px', padding: '10px 14px', color: 'var(--text-muted)', fontSize: 14 }}>$</span>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: '0 6px 6px 0', padding: '10px 14px', color: 'var(--text-primary)', fontSize: 14, width: 160, outline: 'none', fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        </label>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Investment Horizon</div>
          <select
            value={horizon}
            onChange={e => setHorizon(e.target.value)}
            style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer', width: 200 }}
          >
            {['1-2y', '3-5y', '5-10y', '10y+'].map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Excluded Sectors</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {SECTORS.map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 14px', borderRadius: 8, border: `1px solid ${excluded.includes(s) ? 'var(--amber)' : 'var(--border)'}`, background: excluded.includes(s) ? 'var(--amber-dim)' : 'var(--bg-surface-raised)', transition: 'all 150ms ease' }}>
                <input type="checkbox" checked={excluded.includes(s)} onChange={() => toggleSector(s)} style={{ accentColor: 'var(--amber)' }} />
                <span style={{ fontSize: 13, color: excluded.includes(s) ? 'var(--amber)' : 'var(--text-secondary)', textTransform: 'capitalize' }}>{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Email Alerts</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Get notified about significant market moves</div>
          </div>
          <div
            onClick={() => setEmailAlerts(!emailAlerts)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: emailAlerts ? 'var(--green)' : 'var(--bg-surface-raised)',
              border: `1px solid ${emailAlerts ? 'var(--green)' : 'var(--border)'}`,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 200ms ease',
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 2,
              left: emailAlerts ? 22 : 2,
              transition: 'left 200ms ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: 14 }}>
            Save changes
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              ✓ Changes saved
            </span>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Account</h2>
        <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Email:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{MOCK_USER.email}</span>
        </div>
      </div>
    </div>
  );
}
