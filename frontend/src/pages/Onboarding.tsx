import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/* ─── Step 1: Classic risk quiz (5 sub-questions → risk_score 1-10) ─── */
const RISK_QUESTIONS = [
  {
    question: '¿Cuál es tu horizonte de inversión?',
    options: [
      { label: '1-2 años', value: 1 },
      { label: '3-5 años', value: 2 },
      { label: '5-10 años', value: 3 },
      { label: '10+ años', value: 4 },
    ],
  },
  {
    question: '¿Cómo reaccionarías si tu portafolio cae un 20%?',
    options: [
      { label: 'Vendería todo de inmediato', value: 0 },
      { label: 'Esperaría que se recupere', value: 2 },
      { label: 'Compraría más a precios bajos', value: 4 },
    ],
  },
  {
    question: '¿Qué tan estable es tu ingreso?',
    options: [
      { label: 'Irregular o freelance', value: 0 },
      { label: 'Variable pero consistente', value: 1 },
      { label: 'Salario fijo', value: 2 },
    ],
  },
  {
    question: '¿Cuánto sabes sobre inversiones?',
    options: [
      { label: 'Principiante', value: 0 },
      { label: 'Intermedio', value: 2 },
      { label: 'Avanzado', value: 3 },
    ],
  },
  {
    question: '¿Cuánto puedes invertir mensualmente?',
    options: [
      { label: 'Menos de $500', value: 1 },
      { label: '$500 a $5,000', value: 2 },
      { label: 'Más de $5,000', value: 3 },
    ],
  },
];

/* ─── Steps 2–7: Life profile questions ─── */
const LIFE_STEPS = [
  {
    key: 'age_group',
    question: '¿En qué etapa de vida estás?',
    options: [
      { label: '18-24 años', value: '18-24' },
      { label: '25-34 años', value: '25-34' },
      { label: '35-44 años', value: '35-44' },
      { label: '45-54 años', value: '45-54' },
      { label: '55 años o más', value: '55+' },
    ],
  },
  {
    key: 'occupation_type',
    question: '¿Cuál describe mejor tu situación laboral?',
    options: [
      { label: 'Estudiante', value: 'student' },
      { label: 'Empleado con salario fijo', value: 'employed_fixed' },
      { label: 'Independiente / Freelance', value: 'freelance' },
      { label: 'Empresario / Emprendedor', value: 'entrepreneur' },
      { label: 'Sin empleo actualmente', value: 'unemployed' },
      { label: 'Jubilado / Pensionado', value: 'retired' },
    ],
  },
  {
    key: 'education_level',
    question: '¿Cuál es tu nivel educativo?',
    options: [
      { label: 'Bachillerato / Secundaria', value: 'high_school' },
      { label: 'Técnico / Tecnólogo', value: 'technical' },
      { label: 'Universitario', value: 'university' },
      { label: 'Posgrado (maestría / doctorado)', value: 'postgrad' },
    ],
  },
  {
    key: 'family_context',
    question: '¿Cuál describe mejor tu situación familiar?',
    options: [
      { label: 'Soltero/a sin dependientes', value: 'single_no_deps' },
      { label: 'Soltero/a con dependientes', value: 'single_with_deps' },
      { label: 'En pareja sin hijos', value: 'couple_no_kids' },
      { label: 'En pareja con hijos', value: 'couple_with_kids' },
      { label: 'Familia numerosa', value: 'large_family' },
    ],
  },
  {
    key: 'primary_goal',
    question: '¿Cuál es tu objetivo financiero principal ahora mismo?',
    options: [
      { label: 'Construir mi fondo de emergencia', value: 'emergency_fund' },
      { label: 'Ahorrar para comprar vivienda', value: 'buy_home' },
      { label: 'Financiar educación (propia o de hijos)', value: 'education' },
      { label: 'Planificar mi jubilación', value: 'retirement' },
      { label: 'Hacer crecer mi patrimonio', value: 'wealth_growth' },
      { label: 'Solo quiero aprender por ahora', value: 'general_learning' },
    ],
  },
  {
    key: 'motivation',
    question: '¿Por qué quieres usar FinVise?',
    options: [
      { label: 'Me da curiosidad el mundo de las inversiones', value: 'curiosity' },
      { label: 'Quiero entender antes de empezar a invertir', value: 'learn_before_invest' },
      { label: 'Ya invierto y quiero mejorar mi criterio', value: 'already_invest' },
      { label: 'Es para un proyecto académico', value: 'academic' },
      { label: 'Otro motivo', value: 'other' },
    ],
  },
];

const PROFILES: Record<string, { name: string; desc: string }> = {
  conservative: {
    name: 'Inversor Conservador',
    desc: 'Priorizas la preservación del capital y los ingresos estables. Bonos, efectivo y activos de baja volatilidad conforman el núcleo de tu portafolio ideal.',
  },
  balanced: {
    name: 'Inversor Equilibrado',
    desc: 'Buscas un balance entre crecimiento y estabilidad. Una mezcla diversificada de acciones y bonos se adapta bien a tu apetito de riesgo moderado.',
  },
  growth: {
    name: 'Inversor de Crecimiento',
    desc: 'Aceptas mayor volatilidad a cambio de retornos más sólidos a largo plazo. Tecnología, renta variable y activos reales dominan tu portafolio.',
  },
  aggressive: {
    name: 'Inversor Agresivo',
    desc: 'Abrazas el máximo riesgo por el máximo potencial. Tecnología concentrada, crypto y acciones de alto crecimiento son tu zona de confort.',
  },
};

function getProfileKey(score: number) {
  if (score <= 3) return 'conservative';
  if (score <= 6) return 'balanced';
  if (score <= 8) return 'growth';
  return 'aggressive';
}

/* ─── Main component ─── */
export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  // Phase 1: risk quiz
  const [riskStep, setRiskStep]       = useState(0);
  const [riskAnswers, setRiskAnswers] = useState<number[]>([]);
  const [riskSelected, setRiskSelected] = useState<number | null>(null);
  const [riskScore, setRiskScore]     = useState(0);
  const [riskDone, setRiskDone]       = useState(false);

  // Phase 2: life profile
  const [lifeStep, setLifeStep]       = useState(0);
  const [lifeAnswers, setLifeAnswers] = useState<Record<string, string>>({});
  const [lifeSelected, setLifeSelected] = useState<string | null>(null);
  const [lifeDone, setLifeDone]       = useState(false);

  const [animating, setAnimating]     = useState(false);

  // Total steps for progress bar: 5 risk + 6 life
  const totalSteps = 11;
  const currentStep = riskDone ? 5 + lifeStep + 1 : riskStep + 1;

  /* ─── Risk quiz handlers ─── */
  function handleRiskNext() {
    if (riskSelected === null) return;
    const newAnswers = [...riskAnswers, riskSelected];
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (riskStep + 1 >= RISK_QUESTIONS.length) {
        const sum   = newAnswers.reduce((a, b) => a + b, 0);
        const score = Math.max(1, Math.round((sum / 16) * 10));
        setRiskScore(score);
        setRiskAnswers(newAnswers);
        setRiskDone(true);
        setRiskSelected(null);
      } else {
        setRiskAnswers(newAnswers);
        setRiskStep(riskStep + 1);
        setRiskSelected(null);
      }
    }, 200);
  }

  /* ─── Life profile handlers ─── */
  async function saveProfile(answers: typeof lifeAnswers) {
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, risk_score: riskScore, ...answers });
      await refreshProfile();
    }
  }

  function handleLifeNext() {
    if (lifeSelected === null) return;
    const key = LIFE_STEPS[lifeStep].key;
    const newAnswers = { ...lifeAnswers, [key]: lifeSelected };
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (lifeStep + 1 >= LIFE_STEPS.length) {
        setLifeAnswers(newAnswers);
        setLifeDone(true);
        saveProfile(newAnswers).catch(() => {});
      } else {
        setLifeAnswers(newAnswers);
        setLifeStep(lifeStep + 1);
        setLifeSelected(null);
      }
    }, 200);
  }

  const profile = PROFILES[getProfileKey(riskScore)];

  /* ─── Results screen ─── */
  if (lifeDone) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }} className="fade-slide-up">
          <div style={{ fontSize: 80, fontFamily: 'DM Serif Display, serif', color: 'var(--gold)', lineHeight: 1 }}>{riskScore}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>puntuación de riesgo / 10</div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 30, color: 'var(--text-primary)', margin: '16px 0 12px' }}>
            {profile.name}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
            {profile.desc}
          </p>

          {/* Profile summary */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', marginBottom: 32, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tu perfil educativo
            </div>
            {Object.entries(lifeAnswers).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                <span style={{ color: 'var(--text-primary)' }}>{v.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/encuesta?type=pre')}
            style={{ width: '100%', padding: '14px', fontSize: 16 }}
          >
            Ver mi perfil educativo →
          </button>
        </div>
      </div>
    );
  }

  /* ─── Life profile phase ─── */
  if (riskDone) {
    const step = LIFE_STEPS[lifeStep];
    return (
      <OnboardingShell currentStep={currentStep} totalSteps={totalSteps}>
        <div style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'none', transition: 'all 200ms ease' }}>
          <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Perfil de vida · {lifeStep + 1} / {LIFE_STEPS.length}
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: 'var(--text-primary)', margin: '0 0 28px' }}>
            {step.question}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {step.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setLifeSelected(opt.value)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  border: `2px solid ${lifeSelected === opt.value ? 'var(--gold)' : 'var(--border)'}`,
                  background: lifeSelected === opt.value ? 'rgba(212,168,67,0.1)' : 'var(--bg-surface)',
                  color: lifeSelected === opt.value ? 'var(--gold)' : 'var(--text-primary)',
                  fontSize: 14,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: lifeSelected === opt.value ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleLifeNext}
            disabled={lifeSelected === null}
            style={{ marginTop: 28, width: '100%', padding: '14px', fontSize: 16, opacity: lifeSelected === null ? 0.5 : 1, cursor: lifeSelected === null ? 'not-allowed' : 'pointer' }}
          >
            {lifeStep + 1 >= LIFE_STEPS.length ? 'Ver mi perfil educativo →' : 'Continuar →'}
          </button>
        </div>
      </OnboardingShell>
    );
  }

  /* ─── Risk quiz phase ─── */
  return (
    <OnboardingShell currentStep={currentStep} totalSteps={totalSteps}>
      <div style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'none', transition: 'all 200ms ease' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Perfil de riesgo · {riskStep + 1} / {RISK_QUESTIONS.length}
        </div>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: 'var(--text-primary)', margin: '0 0 28px' }}>
          {RISK_QUESTIONS[riskStep].question}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {RISK_QUESTIONS[riskStep].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setRiskSelected(opt.value)}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                border: `2px solid ${riskSelected === opt.value ? 'var(--gold)' : 'var(--border)'}`,
                background: riskSelected === opt.value ? 'rgba(212,168,67,0.1)' : 'var(--bg-surface)',
                color: riskSelected === opt.value ? 'var(--gold)' : 'var(--text-primary)',
                fontSize: 14,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: riskSelected === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleRiskNext}
          disabled={riskSelected === null}
          style={{ marginTop: 28, width: '100%', padding: '14px', fontSize: 16, opacity: riskSelected === null ? 0.5 : 1, cursor: riskSelected === null ? 'not-allowed' : 'pointer' }}
        >
          {riskStep + 1 >= RISK_QUESTIONS.length ? 'Pasar al perfil de vida →' : 'Continuar →'}
        </button>
      </div>
    </OnboardingShell>
  );
}

function OnboardingShell({ children, currentStep, totalSteps }: {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 48px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--gold)' }}>F</span>invise
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paso {currentStep} de {totalSteps}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--bg-surface-raised)' }}>
        <div style={{ height: '100%', width: `${(currentStep / totalSteps) * 100}%`, background: 'var(--gold)', transition: 'width 400ms ease' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
