import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const PROFILE_NAMES: Record<string, string> = {
  '1': 'Conservative', '2': 'Conservative', '3': 'Conservative',
  '4': 'Balanced', '5': 'Balanced', '6': 'Balanced',
  '7': 'Growth', '8': 'Growth',
  '9': 'Aggressive', '10': 'Aggressive',
};

const SECTORS = ['energy', 'crypto', 'tobacco', 'weapons'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const riskScore = profile?.risk_score ?? 7;
  const [excluded, setExcluded] = useState<string[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_preferences')
      .select('excluded_sectors, event_count')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setExcluded(data.excluded_sectors ?? []);
          setEventCount(data.event_count ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  function toggleSector(s: string) {
    setExcluded(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleSave() {
    if (!user) return;
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        { user_id: user.id, excluded_sectors: excluded, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const profileName = PROFILE_NAMES[String(riskScore)] || 'Balanced';
  const personalizationPct = Math.min(Math.round((eventCount / 20) * 100), 100);

  if (loading) return null;

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
          <span>{eventCount} interactions recorded</span>
          <span style={{ color: 'var(--text-muted)' }}>{eventCount} / 20</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-surface-raised)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${personalizationPct}%`, background: 'var(--gold)', borderRadius: 3 }} />
        </div>
      </div>

      {/* Settings */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>Preferences</h2>

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
          <span style={{ color: 'var(--text-secondary)' }}>{user?.email ?? ''}</span>
        </div>
      </div>
    </div>
  );
}
