import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendation, getSurvey, getBiasAnalysis, logBehaviorEvent } from '../services/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Recommendation, RecommendationItem, BiasAnalysisResult } from '../types';
import { dashboardCache } from '../lib/dashboardCache';
import LiveStrip from '../components/LiveStrip';
import ScenarioTabs from '../components/ScenarioTabs';
import PersonalizationProgress from '../components/PersonalizationProgress';
import BiasAlert from '../components/BiasAlert';
import AcademicBanner from '../components/AcademicBanner';
import PortfolioSimulator from '../components/PortfolioSimulator';

export type AssetPreferences = Record<string, { saved: boolean; liked: boolean; disliked: boolean }>;

function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 24, width: '60%' }} />
      <div className="skeleton" style={{ height: 32, width: '40%' }} />
      <div className="skeleton" style={{ height: 6, width: '100%' }} />
      <div className="skeleton" style={{ height: 60, width: '100%' }} />
      <div className="skeleton" style={{ height: 44, width: '100%' }} />
    </div>
  );
}

function getDynamicSubtitle(profile: any, riskScore: number): string {
  if (!profile) return `Tu portafolio educativo del día · Perfil de riesgo ${riskScore}/10`;
  if (profile.age_group === '18-24' && profile.occupation_type === 'student')
    return 'Tu portafolio educativo · perspectiva para estudiantes';
  if (profile.occupation_type === 'freelance')
    return 'Tu portafolio educativo · perfil independiente con ingreso variable';
  if (profile.primary_goal === 'emergency_fund')
    return 'Primero el fondo de emergencia: qué activos conocer';
  return `Tu portafolio educativo del día · Perfil de riesgo ${riskScore}/10`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [data, setData]               = useState<Recommendation | null>(dashboardCache.get());
  const [activeItems, setActiveItems] = useState<RecommendationItem[] | null>(dashboardCache.get()?.recommendations ?? null);
  const [loading, setLoading]         = useState(!dashboardCache.get());
  const [postSurveyDone, setPostSurveyDone] = useState(false);
  const [eventCount, setEventCount]   = useState(0);
  const [biasAnalysis, setBiasAnalysis] = useState<BiasAnalysisResult | null>(null);
  const [preferences, setPreferences] = useState<AssetPreferences>({});

  const riskScore = profile?.risk_score ?? 7;

  useEffect(() => {
    if (dashboardCache.get()) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await getRecommendation(riskScore);
        dashboardCache.set(result);
        setData(result);
        setActiveItems(result.recommendations);
        logBehaviorEvent('recommendation_requested', { asset_class: 'portfolio', sector: 'broad_market' });
      } catch { /* backend always responds; log is enough */ }
      finally { setLoading(false); }
    }, 1500);

    return () => clearTimeout(timer);
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getSurvey('post').then(s => setPostSurveyDone(!!s));

    if (profile?.id) {
      supabase.from('user_preferences').select('event_count').eq('user_id', profile.id).single()
        .then(({ data }) => { if (data?.event_count) setEventCount(data.event_count); });
      getBiasAnalysis().then(setBiasAnalysis);

      // Reconstruct persisted card states from event history
      supabase
        .from('user_events')
        .select('asset_ticker, event_type')
        .eq('user_id', profile.id)
        .in('event_type', ['rate_up', 'rate_down', 'save', 'unsave'])
        .not('asset_ticker', 'is', null)
        .order('created_at', { ascending: false })
        .then(({ data: events }) => {
          if (!events?.length) return;
          const prefs: AssetPreferences = {};
          const ratingDone = new Set<string>();
          const saveDone   = new Set<string>();
          for (const ev of events) {
            const t = ev.asset_ticker as string;
            if (!t) continue;
            if (!prefs[t]) prefs[t] = { saved: false, liked: false, disliked: false };
            if ((ev.event_type === 'rate_up' || ev.event_type === 'rate_down') && !ratingDone.has(t)) {
              prefs[t].liked    = ev.event_type === 'rate_up';
              prefs[t].disliked = ev.event_type === 'rate_down';
              ratingDone.add(t);
            }
            if ((ev.event_type === 'save' || ev.event_type === 'unsave') && !saveDone.has(t)) {
              prefs[t].saved = ev.event_type === 'save';
              saveDone.add(t);
            }
          }
          setPreferences(prefs);
        });
    }
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtitle         = getDynamicSubtitle(profile, riskScore);
  const showSurveyPrompt = eventCount > 20 && !postSurveyDone;
  const topBias          = biasAnalysis?.active?.[0] ?? null;

  return (
    <div style={{ paddingBottom: 80 }}>
      <LiveStrip />
      <div style={{ marginTop: 32, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Mi diario de aprendizaje
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{subtitle}</p>
        </div>
        {showSurveyPrompt && (
          <button onClick={() => navigate('/encuesta?type=post')} style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: 8,
            padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
          }}>
            Completar encuesta de impacto →
          </button>
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <ScenarioTabs initialData={data} onItemsChange={setActiveItems} preferences={preferences} />
        )}
      </div>

      {!loading && topBias && (
        <BiasAlert
          biasType={topBias.key}
          message={topBias.name}
          strength={topBias.score}
          intervention={topBias.intervention}
          tip={topBias.tip}
          evidence={topBias.evidence}
          icon={topBias.icon}
        />
      )}

      {!loading && data && (
        <>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 24 }}>{data.market_summary}</p>
          <PortfolioSimulator data={activeItems ? { ...data, recommendations: activeItems } : data} />
          <PersonalizationProgress eventCount={eventCount || 5} />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>{data.disclaimer}</p>
        </>
      )}
      <AcademicBanner />
    </div>
  );
}
