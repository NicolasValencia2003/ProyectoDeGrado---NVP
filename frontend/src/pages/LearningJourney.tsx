import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getHistory, getSurveyComparison, getBiasAnalysis, getBanditProfile } from '../services/api';
import type { BanditProfile } from '../services/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { HistoryEntry, SurveyResponse, BiasAnalysisResult } from '../types';
import AcademicBanner from '../components/AcademicBanner';

const SECTOR_COLORS: Record<string, string> = {
  technology:  '#3b82f6',
  finance:     '#8b5cf6',
  healthcare:  '#10b981',
  energy:      '#f59e0b',
  consumer:    '#ec4899',
  real_estate: '#d4a843',
  bonds:       '#6b7280',
  crypto:      '#f97316',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: color || 'var(--text-primary)', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

function ScoreComparison({ pre, post }: { pre: SurveyResponse; post: SurveyResponse }) {
  const delta = post.section_a_score - pre.section_a_score;
  const deltaColor = delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--text-muted)';
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        📊 Impacto educativo medido
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Conocimiento financiero (pre)', value: `${pre.section_a_score}/8` },
          { label: 'Conocimiento financiero (post)', value: `${post.section_a_score}/8` },
          { label: 'Mejora en conocimiento', value: `${delta >= 0 ? '+' : ''}${delta}`, color: deltaColor },
          { label: 'Confianza en decisiones (post)', value: `${post.section_b_score.toFixed(1)}/5.0` },
          { label: 'Autoconciencia de sesgos (post)', value: `${post.section_c_score.toFixed(1)}/5.0` },
          { label: 'Valoración general', value: `${post.overall_rating}/10` },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: item.color || 'var(--text-primary)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
      {post.open_feedback && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--blue-dim)', borderLeft: '3px solid var(--blue)', borderRadius: '0 6px 6px 0' }}>
          <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 700, marginBottom: 4 }}>Tu feedback:</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{post.open_feedback}</p>
        </div>
      )}
    </div>
  );
}

// ─── Bias Radar (SVG pentagon) ──────────────────────────────────────────────

const BIAS_ORDER = ['recency', 'familiarity', 'loss_aversion', 'overconfidence', 'disposition'];
const BIAS_LABELS: Record<string, string> = {
  recency:        'Recencia',
  familiarity:    'Familiaridad',
  loss_aversion:  'Avers. Pérdida',
  overconfidence: 'Exceso Conf.',
  disposition:    'Disposición',
};
const BIAS_ICONS: Record<string, string> = {
  recency: '⏱', familiarity: '🔍', loss_aversion: '📉', overconfidence: '🎯', disposition: '⚖️',
};
// Pentagon vertices: center (120,120), outer radius 85
const cx = 120, cy = 120, r = 85;
const VERTICES = BIAS_ORDER.map((_, i) => {
  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
});
const LABEL_OFFSET = 1.32;
const LABEL_POS = BIAS_ORDER.map((_, i) => {
  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  return { x: cx + r * LABEL_OFFSET * Math.cos(angle), y: cy + r * LABEL_OFFSET * Math.sin(angle) };
});

function polygonPoints(scores: number[]) {
  return VERTICES.map((v, i) => {
    const s = scores[i] ?? 0;
    return `${cx + s * (v.x - cx)},${cy + s * (v.y - cy)}`;
  }).join(' ');
}

function BiasRadar({ analysis }: { analysis: BiasAnalysisResult }) {
  const scores = BIAS_ORDER.map(k => analysis.scores[k] ?? 0);
  const outerPts = VERTICES.map(v => `${v.x},${v.y}`).join(' ');
  const mid50  = VERTICES.map(v => `${cx + 0.5 * (v.x - cx)},${cy + 0.5 * (v.y - cy)}`).join(' ');
  const mid25  = VERTICES.map(v => `${cx + 0.25 * (v.x - cx)},${cy + 0.25 * (v.y - cy)}`).join(' ');

  return (
    <div className="card" style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        🧠 Perfil de sesgos cognitivos
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>
        Análisis conductual basado en tus patrones de uso · Motor FinVise
      </p>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* SVG radar */}
        <svg viewBox="0 0 240 240" style={{ width: 240, height: 240, flexShrink: 0 }}>
          {/* Grid rings */}
          <polygon points={outerPts} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.5" />
          <polygon points={mid50}   fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.35" strokeDasharray="3,3" />
          <polygon points={mid25}   fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.25" strokeDasharray="3,3" />
          {/* Spokes */}
          {VERTICES.map((v, i) => (
            <line key={i} x1={cx} y1={cy} x2={v.x} y2={v.y} stroke="var(--border)" strokeWidth="1" opacity="0.4" />
          ))}
          {/* Filled polygon */}
          <polygon
            points={polygonPoints(scores)}
            fill="rgba(245,158,11,0.18)"
            stroke="var(--amber)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Score dots */}
          {scores.map((s, i) => {
            const x = cx + s * (VERTICES[i].x - cx);
            const y = cy + s * (VERTICES[i].y - cy);
            return <circle key={i} cx={x} cy={y} r="4" fill={s >= 0.45 ? 'var(--amber)' : 'var(--text-muted)'} />;
          })}
          {/* Labels */}
          {LABEL_POS.map((pos, i) => {
            const key = BIAS_ORDER[i];
            const score = scores[i];
            const isActive = score >= 0.45;
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="DM Sans, sans-serif"
                fill={isActive ? 'var(--amber)' : 'var(--text-muted)'}
                fontWeight={isActive ? '700' : '400'}
              >
                {BIAS_ICONS[key]} {BIAS_LABELS[key]}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BIAS_ORDER.map((key, i) => {
              const score = scores[i];
              const isActive = score >= 0.45;
              const pct = Math.round(score * 100);
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: isActive ? 'var(--amber)' : 'var(--text-secondary)', fontWeight: isActive ? 600 : 400 }}>
                      {BIAS_ICONS[key]} {BIAS_LABELS[key]}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: isActive ? 'var(--amber)' : 'var(--text-muted)' }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-surface-raised)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: isActive
                        ? 'linear-gradient(90deg, var(--amber), #f97316)'
                        : 'var(--text-muted)',
                      borderRadius: 2, transition: 'width 600ms ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
          {analysis.active.length > 0 ? (
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--amber)', lineHeight: 1.6 }}>
              ⚠️ {analysis.active.length} sesgo{analysis.active.length > 1 ? 's' : ''} activo{analysis.active.length > 1 ? 's' : ''} detectado{analysis.active.length > 1 ? 's' : ''}.
              Revisa el <strong>Dashboard</strong> para la intervención educativa.
            </div>
          ) : (
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--green)', lineHeight: 1.6 }}>
              ✓ Sin sesgos activos detectados. ¡Sigue explorando para enriquecer el análisis!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function LearningJourney() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [history, setHistory]     = useState<HistoryEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [comparison, setComparison] = useState<{ pre: SurveyResponse | null; post: SurveyResponse | null }>({ pre: null, post: null });
  const [biasLog, setBiasLog]     = useState<{ type: string; date: string }[]>([]);
  const [viewedTickerCount, setViewedTickerCount] = useState(0);
  const [biasAnalysis, setBiasAnalysis] = useState<BiasAnalysisResult | null>(null);
  const [banditProfile, setBanditProfile] = useState<BanditProfile | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getHistory().catch(() => [] as HistoryEntry[]),
      getSurveyComparison(),
      getBiasAnalysis(),
      getBanditProfile(),
    ]).then(([hist, comp, bias, bandit]) => {
      setHistory(hist);
      setComparison(comp);
      setBiasAnalysis(bias);
      setBanditProfile(bandit);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('user_events')
      .select('asset_ticker, created_at')
      .eq('user_id', profile.id)
      .eq('event_type', 'bias_acknowledged')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setBiasLog(data.map(e => ({
            type: e.asset_ticker,
            date: formatDate(e.created_at),
          })));
        }
      });

    supabase
      .from('user_events')
      .select('asset_ticker')
      .eq('user_id', profile.id)
      .eq('event_type', 'view')
      .not('asset_ticker', 'is', null)
      .then(({ data }) => {
        if (data) {
          setViewedTickerCount(new Set(data.map(e => e.asset_ticker)).size);
        }
      });
  }, [profile?.id]);

  const uniqueTickersFromHistory = new Set(history.flatMap(e => e.payload.recommendations.map(r => r.ticker)));
  const uniqueAssetCount = Math.max(uniqueTickersFromHistory.size, viewedTickerCount);
  const biasCount = biasLog.length;

  // Build sector evolution data from history
  const sectorChartData = history.slice().reverse().map(entry => {
    const sectorMap: Record<string, number> = {};
    for (const rec of entry.payload.recommendations) {
      sectorMap[rec.sector] = (sectorMap[rec.sector] || 0) + rec.allocation_pct;
    }
    return { date: formatDate(entry.created_at), ...sectorMap };
  });

  const allSectors = Array.from(new Set(history.flatMap(e => e.payload.recommendations.map(r => r.sector))));

  const fearGreedColor = (score: number) => {
    if (score <= 25) return 'var(--red)';
    if (score <= 45) return '#f97316';
    if (score <= 55) return 'var(--text-secondary)';
    if (score <= 75) return 'var(--green)';
    return '#86efac';
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Mi trayectoria de aprendizaje
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Tu evolución educativa en FinVise
          </p>
        </div>
        {!comparison.post && (
          <button
            onClick={() => navigate('/encuesta?type=post')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Completar encuesta de impacto →
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 60 }}>Cargando tu trayectoria...</div>
      ) : (
        <>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon="📅" label="Sesiones de aprendizaje" value={history.length} />
            <StatCard icon="🔍" label="Activos explorados únicos" value={uniqueAssetCount} />
            <StatCard icon="🧠" label="Sesgos reconocidos" value={biasCount} color="var(--amber)" />
            {comparison.pre && (
              <StatCard icon="📝" label="Encuesta pre completada" value="✓" color="var(--green)" />
            )}
            {comparison.post && (
              <StatCard icon="🎓" label="Encuesta post completada" value="✓" color="var(--green)" />
            )}
          </div>

          {/* ── Panel 1: UCB1 learning profile ───────────────────────── */}
          {banditProfile && banditProfile.total_feedback_events > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                🤖 Motor de aprendizaje UCB1 — Perfil aprendido
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                El algoritmo Multi-Armed Bandit ha procesado{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{banditProfile.total_feedback_events}</strong> eventos de feedback
                sobre <strong style={{ color: 'var(--text-primary)' }}>{banditProfile.total_tickers_seen}</strong> activos distintos.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                {/* Liked tickers */}
                {banditProfile.top_liked.length > 0 && (
                  <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginBottom: 10 }}>✓ Activos con recompensa positiva</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {banditProfile.top_liked.map(t => (
                        <div key={t.ticker} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.ticker}</span>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.feedback_count} ev.</span>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>+{t.net_reward.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Disliked tickers */}
                {banditProfile.top_disliked.length > 0 && (
                  <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700, marginBottom: 10 }}>✗ Activos con recompensa negativa</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {banditProfile.top_disliked.map(t => (
                        <div key={t.ticker} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.ticker}</span>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.feedback_count} ev.</span>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>{t.net_reward.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* UCB1 summary metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Nivel de personalización', value: `${banditProfile.personalization_pct}%`, color: banditProfile.personalization_pct >= 80 ? 'var(--green)' : banditProfile.personalization_pct >= 40 ? 'var(--amber)' : 'var(--text-muted)' },
                  { label: 'Tasa de feedback positivo', value: `${banditProfile.positive_rate}%`, color: banditProfile.positive_rate >= 60 ? 'var(--green)' : 'var(--text-secondary)' },
                  { label: 'Eventos de feedback', value: banditProfile.total_feedback_events, color: 'var(--text-primary)' },
                  { label: 'Activos explorados', value: banditProfile.total_tickers_seen, color: 'var(--text-primary)' },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '14px 0 0', lineHeight: 1.6 }}>
                Fórmula UCB1: score(i) = μᵢ + √2 · √(ln N / nᵢ) — Los activos con recompensa positiva aparecen primero en futuras recomendaciones; los nunca vistos se exploran prioritariamente.
              </p>
            </div>
          )}

          {/* ── Panel 2: Educational impact metrics ──────────────────── */}
          {(comparison.pre || comparison.post) && (() => {
            const hasBoth = !!(comparison.pre && comparison.post);
            const knowledgeGainPct = hasBoth
              ? Math.round(((comparison.post!.section_a_score - comparison.pre!.section_a_score) / 8) * 100)
              : null;
            const confidenceDelta = hasBoth
              ? comparison.post!.section_b_score - comparison.pre!.section_b_score
              : null;

            return (
              <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--blue)', borderRadius: '0 12px 12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    📐 Impacto educativo
                  </div>
                  {!hasBoth && (
                    <button
                      onClick={() => navigate(comparison.pre ? '/encuesta?type=post' : '/encuesta?type=pre')}
                      style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: 'var(--blue-dim)', border: '1px solid var(--blue)', color: 'var(--blue)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {comparison.pre ? 'Completar encuesta post →' : 'Completar encuesta pre →'}
                    </button>
                  )}
                </div>

                {/* Row 1: Knowledge */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Sección A — Ganancia de conocimiento financiero
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                    {comparison.pre && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Línea base (pre)</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {comparison.pre.section_a_score}/8
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{Math.round((comparison.pre.section_a_score / 8) * 100)}% correcto</div>
                      </div>
                    )}
                    {comparison.post && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Post uso (post)</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {comparison.post.section_a_score}/8
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{Math.round((comparison.post.section_a_score / 8) * 100)}% correcto</div>
                      </div>
                    )}
                    {hasBoth && knowledgeGainPct !== null && (
                      <div style={{ background: knowledgeGainPct > 0 ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface-raised)', border: knowledgeGainPct > 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Ganancia</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: knowledgeGainPct > 0 ? 'var(--green)' : knowledgeGainPct < 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                          {knowledgeGainPct >= 0 ? '+' : ''}{knowledgeGainPct}%
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          (post − pre) / 8 × 100
                        </div>
                      </div>
                    )}
                    {!comparison.post && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px', opacity: 0.5, border: '1px dashed var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Ganancia</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>—</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Requiere encuesta post</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Confidence */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Sección B — Confianza en decisiones financieras (5 ítems × 5 pts)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                    {comparison.pre && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Pre (prom. / ítem)</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {comparison.pre.section_b_score.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>de 5.00</div>
                      </div>
                    )}
                    {comparison.post && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Post (prom. / ítem)</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: comparison.post.section_b_score >= 3.5 ? 'var(--green)' : 'var(--amber)' }}>
                          {comparison.post.section_b_score.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>de 5.00</div>
                      </div>
                    )}
                    {hasBoth && confidenceDelta !== null && (
                      <div style={{ background: confidenceDelta > 0 ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface-raised)', border: confidenceDelta > 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Incremento</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: confidenceDelta > 0 ? 'var(--green)' : confidenceDelta < 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                          {confidenceDelta >= 0 ? '+' : ''}{confidenceDelta.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>promedio por ítem</div>
                      </div>
                    )}
                    {!comparison.post && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px', opacity: 0.5, border: '1px dashed var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Incremento</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>—</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Requiere encuesta post</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: Bias awareness */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Sección C — Autoconciencia de sesgos cognitivos (4 ítems × 5 pts)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                    {comparison.pre && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Pre (prom. / ítem)</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {comparison.pre.section_c_score.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>de 5.00</div>
                      </div>
                    )}
                    {comparison.post && (
                      <div style={{ background: comparison.post.section_c_score >= 3.5 ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface-raised)', border: comparison.post.section_c_score >= 3.5 ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Post (prom. / ítem)</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: comparison.post.section_c_score >= 3.5 ? 'var(--green)' : 'var(--amber)' }}>
                          {comparison.post.section_c_score.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>de 5.00</div>
                      </div>
                    )}
                    {hasBoth && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Delta</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: (comparison.post!.section_c_score - comparison.pre!.section_c_score) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {(comparison.post!.section_c_score - comparison.pre!.section_c_score) >= 0 ? '+' : ''}
                          {(comparison.post!.section_c_score - comparison.pre!.section_c_score).toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>promedio por ítem</div>
                      </div>
                    )}
                    {!comparison.post && (
                      <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 14px', opacity: 0.5, border: '1px dashed var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Post</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>—</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Requiere encuesta post</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Prompt when no surveys at all */}
          {!comparison.pre && !comparison.post && (
            <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--blue)', borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                📐 Impacto educativo
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                Completa la encuesta pre para establecer tu línea base de conocimiento financiero.
              </p>
              <button
                onClick={() => navigate('/encuesta?type=pre')}
                style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, background: 'var(--blue-dim)', border: '1px solid var(--blue)', color: 'var(--blue)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}
              >
                Iniciar encuesta pre →
              </button>
            </div>
          )}

          {/* ── Panel 3: Recommendation history performance ───────────── */}
          {history.length >= 2 && (() => {
            const perfEntries = history.flatMap(e =>
              e.payload.recommendations.filter((r: any) => r.performance_pct !== null && r.performance_pct !== undefined)
            );
            if (perfEntries.length === 0) return null;
            const avg = perfEntries.reduce((s: number, r: any) => s + r.performance_pct, 0) / perfEntries.length;
            const positive = perfEntries.filter((r: any) => r.performance_pct > 0).length;
            const hitRate  = Math.round((positive / perfEntries.length) * 100);
            return (
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  📊 Rendimiento histórico de recomendaciones
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Rendimiento promedio', value: `${avg >= 0 ? '+' : ''}${avg.toFixed(2)}%`, color: avg >= 0 ? 'var(--green)' : 'var(--red)' },
                    { label: 'Tasa de acierto', value: `${hitRate}%`, color: hitRate >= 50 ? 'var(--green)' : 'var(--amber)' },
                    { label: 'Recomendaciones evaluadas', value: perfEntries.length, color: 'var(--text-primary)' },
                    { label: 'Sesiones analizadas', value: history.length, color: 'var(--text-primary)' },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.6 }}>
                  Variación calculada entre el precio al momento de la recomendación y el precio actual de mercado. No constituye asesoramiento financiero.
                </p>
              </div>
            );
          })()}

          {/* Bias radar */}
          {biasAnalysis && <BiasRadar analysis={biasAnalysis} />}

          {/* Pre/post detailed comparison (only when both surveys are done) */}
          {comparison.pre && comparison.post && (
            <ScoreComparison pre={comparison.pre} post={comparison.post} />
          )}

          {/* Sector evolution chart */}
          {sectorChartData.length >= 2 && (
            <div className="card" style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                📈 Evolución de intereses por sector
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={sectorChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(val: any) => [`${Number(val).toFixed(0)}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {allSectors.map(sector => (
                    <Line
                      key={sector}
                      type="monotone"
                      dataKey={sector}
                      stroke={SECTOR_COLORS[sector] || '#6b7280'}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bias acknowledgment log */}
          {biasLog.length > 0 && (
            <div className="card" style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                🧠 Sesgos que reconociste
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {biasLog.map((b, i) => (
                  <span key={i} style={{
                    fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid var(--amber)',
                    color: 'var(--amber)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    {b.type.replace(/_/g, ' ')} · {b.date}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* History table */}
          {history.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Tus sesiones de aprendizaje aparecerán aquí después de tu primera consulta.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {history.map(entry => (
                <div key={entry.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                      {new Date(entry.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        Riesgo: {entry.risk_score_used}/10
                      </span>
                      <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', color: fearGreedColor(entry.market_snapshot.fear_greed) }}>
                        Miedo/Codicia: {entry.market_snapshot.fear_greed} ({entry.market_snapshot.fear_greed_label})
                      </span>
                      <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        Tesoro 10A: {entry.market_snapshot.treasury_10y}%
                      </span>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Activo', 'Peso sugerido', 'Precio inicial', 'Precio actual', 'Variación'].map(h => (
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
          )}
        </>
      )}

      <AcademicBanner />
    </div>
  );
}
