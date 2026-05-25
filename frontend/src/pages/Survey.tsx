import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveSurvey, getSurveyComparison } from '../services/api';

/* ─── Section A: conceptual knowledge ─── */
const SECTION_A = [
  {
    q: '¿Qué significa diversificar un portafolio de inversión?',
    options: [
      'Poner todo el dinero en el activo que más ha subido',
      'Distribuir el dinero entre diferentes tipos de activos para reducir el riesgo',
      'Cambiar de inversión cada semana según las noticias',
      'Invertir solo en empresas del propio país',
    ],
    correct: 1,
    explanation: 'Diversificar significa distribuir el riesgo entre diferentes activos, de modo que la caída de uno afecte menos el total del portafolio.',
  },
  {
    q: 'Un ETF (Exchange-Traded Fund) es:',
    options: [
      'Un tipo de cuenta bancaria de ahorro',
      'Una criptomoneda estable',
      'Una canasta de activos (acciones, bonos, etc.) que se compra como si fuera una sola acción',
      'Un seguro de vida con rendimiento garantizado',
    ],
    correct: 2,
    explanation: 'Un ETF agrupa múltiples activos en un solo instrumento negociable en bolsa, ofreciendo diversificación con una sola transacción.',
  },
  {
    q: 'Si el índice Fear & Greed está en 15 (Extreme Fear), históricamente esto:',
    options: [
      'Garantiza que el mercado seguirá cayendo',
      'Es irrelevante para los inversores a largo plazo',
      'Puede indicar una oportunidad para inversores con horizonte largo',
      'Significa que debes vender todo inmediatamente',
    ],
    correct: 2,
    explanation: 'El miedo extremo históricamente ha coincidido con puntos de entrada atractivos para inversores pacientes con horizontes largos, aunque no garantiza retornos inmediatos.',
  },
  {
    q: '¿Qué activo tiene típicamente MENOR riesgo?',
    options: [
      'Una criptomoneda como Bitcoin',
      'Una acción de una startup tecnológica',
      'Un bono del gobierno de corto plazo',
      'Un ETF de tecnología',
    ],
    correct: 2,
    explanation: 'Los bonos de gobierno de corto plazo (como los T-Bills) tienen el menor riesgo porque están respaldados por el estado y su vencimiento corto minimiza la volatilidad de precio.',
  },
  {
    q: "El 'horizonte de inversión' se refiere a:",
    options: [
      'El máximo que puedes perder sin entrar en pánico',
      'El tiempo que planeas mantener una inversión antes de necesitar el dinero',
      'La ganancia máxima esperada de un activo',
      'El número de activos diferentes que debes tener',
    ],
    correct: 1,
    explanation: 'El horizonte de inversión es el período durante el cual mantendrás tu dinero invertido. Un horizonte largo te permite tolerar más volatilidad a corto plazo.',
  },
  {
    q: 'La volatilidad de un activo describe:',
    options: [
      'La probabilidad de que el activo quiebre',
      'Cuánto puede subir el precio en el mejor escenario',
      'Qué tanto varía el precio de un activo a lo largo del tiempo',
      'La comisión que cobra el broker',
    ],
    correct: 2,
    explanation: 'La volatilidad mide la variación de precios. Alta volatilidad significa que el precio oscila mucho — puede subir mucho, pero también bajar mucho.',
  },
  {
    q: '¿Por qué invertir en un solo activo es más riesgoso que diversificar?',
    options: [
      'Porque los activos únicos tienen comisiones más altas',
      'Porque si ese activo cae mucho, pierdes casi todo; con varios, una caída afecta menos el total',
      'En realidad no es más riesgoso, es más rentable',
      'Porque los reguladores no lo permiten',
    ],
    correct: 1,
    explanation: 'La concentración amplifica tanto las ganancias como las pérdidas. La diversificación no elimina el riesgo, pero lo distribuye para que ningún evento aislado destruya el portafolio.',
  },
  {
    q: "El 'sesgo de recencia' en inversiones significa:",
    options: [
      'Preferir invertir en empresas antiguas y consolidadas',
      'Sobrevalorar los rendimientos recientes como predictor del futuro',
      'Invertir solo en lo que recomienda la familia o amigos',
      'Calcular rendimientos con datos de hace 10 años',
    ],
    correct: 1,
    explanation: 'El sesgo de recencia nos hace creer que lo que pasó ayer seguirá ocurriendo mañana. En inversiones, esto lleva a comprar en picos y vender en caídas — lo opuesto de lo racional.',
  },
];

/* ─── Section B & C labels ─── */
const SECTION_B = [
  'Entiendo mejor mi propio perfil de riesgo como tomador de decisiones financieras',
  'Podría explicarle a alguien qué es la diversificación y por qué importa',
  'Sé identificar cuándo una reacción emocional (miedo o euforia) puede afectar mis decisiones financieras',
  'Me siento más seguro/a explorando el mundo de las inversiones después de usar FinVise',
  'Entiendo por qué no se deben tomar decisiones basadas solo en el rendimiento de ayer',
];

const SECTION_C = [
  'Puedo identificar si estoy favoreciendo un activo solo porque subió ayer',
  'Entiendo qué es el sesgo de familiaridad y cómo puede afectar mis decisiones',
  'Reconozco que mis reacciones emocionales ante pérdidas pueden llevarme a malas decisiones',
  'Soy consciente de que mis preferencias financieras pueden cambiar con el tiempo',
];

function LikertRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>{label}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              border: `2px solid ${value === n ? 'var(--gold)' : 'var(--border)'}`,
              background: value === n ? 'rgba(212,168,67,0.12)' : 'var(--bg-surface-raised)',
              color: value === n ? 'var(--gold)' : 'var(--text-secondary)',
              fontWeight: value === n ? 700 : 400,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 150ms ease',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-muted)' }}>
        <span>Nada de acuerdo</span>
        <span>Totalmente de acuerdo</span>
      </div>
    </div>
  );
}

type Phase = 'intro' | 'A' | 'A_feedback' | 'B' | 'C' | 'D' | 'done';

export default function Survey() {
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const surveyType = (params.get('type') ?? 'pre') as 'pre' | 'post';

  const [phase, setPhase]               = useState<Phase>('intro');
  const [qIdx, setQIdx]                 = useState(0);
  const [aSelected, setASelected]       = useState<number | null>(null);
  const [aAnswers, setAAnswers]         = useState<number[]>([]);
  const [aScore, setAScore]             = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const [bAnswers, setBAnswers] = useState<number[]>(new Array(SECTION_B.length).fill(0));
  const [cAnswers, setCAnswers] = useState<number[]>(new Array(SECTION_C.length).fill(0));

  const [dRating,    setDRating]    = useState(0);
  const [dLearned,   setDLearned]   = useState('');
  const [dRecommend, setDRecommend] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [comparison, setComparison] = useState<{ pre: any; post: any } | null>(null);

  useEffect(() => {
    if (surveyType === 'post') {
      getSurveyComparison().then(setComparison).catch(() => {});
    }
  }, [surveyType]);

  /* ─── A: answer selection ─── */
  function handleAAnswer(idx: number) {
    setASelected(idx);
  }

  function handleANext() {
    if (aSelected === null) return;
    const correct = SECTION_A[qIdx].correct === aSelected ? 1 : 0;
    const newAnswers = [...aAnswers, aSelected];
    setAAnswers(newAnswers);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      if (qIdx + 1 >= SECTION_A.length) {
        setAScore(newAnswers.filter((a, i) => a === SECTION_A[i].correct).length);
        setPhase('B');
      } else {
        setQIdx(qIdx + 1);
        setASelected(null);
      }
    }, 1800);
  }

  /* ─── Submit ─── */
  async function handleSubmit() {
    setSubmitting(true);
    const bScore = parseFloat((bAnswers.reduce((a, b) => a + b, 0) / bAnswers.length).toFixed(4));
    const cScore = parseFloat((cAnswers.reduce((a, b) => a + b, 0) / cAnswers.length).toFixed(4));
    await saveSurvey({
      survey_type:        surveyType,
      section_a_score:    aScore,
      section_a_answers:  aAnswers,
      section_b_score:    bScore,
      section_b_answers:  bAnswers,
      section_c_score:    cScore,
      section_c_answers:  cAnswers,
      section_d_rating:   dRating,
      section_d_learned:  dLearned,
      section_d_recommend: dRecommend,
    } as any).catch(() => {});
    setSubmitting(false);
    setPhase('done');
  }

  /* ─── Render ─── */
  if (phase === 'intro') {
    return (
      <SurveyShell title={surveyType === 'pre' ? 'Encuesta inicial' : 'Encuesta de cierre'} progress={0}>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>
          {surveyType === 'pre'
            ? 'Antes de explorar FinVise, queremos conocer tu punto de partida. Esta encuesta es parte de una investigación académica y tus respuestas son completamente confidenciales.'
            : 'Ahora que has explorado FinVise, queremos medir tu progreso de aprendizaje. Tus respuestas ayudarán a mejorar la herramienta.'}
        </p>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Esta encuesta tiene 4 secciones:</div>
          {['A — Conocimiento conceptual (8 preguntas)', 'B — Confianza en decisiones (5 afirmaciones)', 'C — Autoconciencia de sesgos (4 afirmaciones)', 'D — Tu experiencia con FinVise'].map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--text-primary)', padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              {s}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setPhase('A')} style={{ width: '100%', padding: '14px', fontSize: 15 }}>
          Comenzar encuesta →
        </button>
      </SurveyShell>
    );
  }

  if (phase === 'A') {
    const q = SECTION_A[qIdx];
    const isCorrect = aSelected !== null && aSelected === q.correct;
    return (
      <SurveyShell title="Sección A — Conocimiento conceptual" progress={(qIdx / SECTION_A.length) * 25}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Pregunta {qIdx + 1} de {SECTION_A.length}</div>
        <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 24, fontWeight: 500 }}>{q.q}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map((opt, i) => {
            let border = 'var(--border)';
            let bg     = 'var(--bg-surface)';
            let color  = 'var(--text-primary)';
            if (showFeedback) {
              if (i === q.correct)  { border = 'var(--green)'; bg = 'rgba(16,185,129,0.1)'; color = 'var(--green)'; }
              if (aSelected === i && i !== q.correct) { border = 'var(--red)'; bg = 'rgba(244,63,94,0.08)'; color = 'var(--red)'; }
            } else if (aSelected === i) {
              border = 'var(--gold)'; bg = 'rgba(212,168,67,0.1)'; color = 'var(--gold)';
            }
            return (
              <button key={i} onClick={() => !showFeedback && handleAAnswer(i)} disabled={showFeedback} style={{ padding: '12px 16px', borderRadius: 10, border: `2px solid ${border}`, background: bg, color, fontSize: 14, textAlign: 'left', cursor: showFeedback ? 'default' : 'pointer', transition: 'all 150ms ease', fontFamily: 'DM Sans, sans-serif' }}>
                {opt}
              </button>
            );
          })}
        </div>
        {showFeedback && (
          <div style={{ background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)', border: `1px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: isCorrect ? 'var(--green)' : 'var(--text-secondary)', lineHeight: 1.6 }}>
            {isCorrect ? '✓ Correcto. ' : '✗ Incorrecto. '}{q.explanation}
          </div>
        )}
        {!showFeedback && (
          <button className="btn btn-primary" onClick={handleANext} disabled={aSelected === null} style={{ width: '100%', padding: '13px', opacity: aSelected === null ? 0.5 : 1, cursor: aSelected === null ? 'not-allowed' : 'pointer' }}>
            Confirmar respuesta
          </button>
        )}
      </SurveyShell>
    );
  }

  if (phase === 'B') {
    return (
      <SurveyShell title="Sección B — Confianza en decisiones" progress={30}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Indica qué tan de acuerdo estás con cada afirmación (1 = Nada, 5 = Totalmente):</p>
        {SECTION_B.map((label, i) => (
          <LikertRow key={i} label={label} value={bAnswers[i]} onChange={v => { const n = [...bAnswers]; n[i] = v; setBAnswers(n); }} />
        ))}
        <button className="btn btn-primary" onClick={() => setPhase('C')} disabled={bAnswers.some(b => b === 0)} style={{ width: '100%', padding: '13px', marginTop: 8, opacity: bAnswers.some(b => b === 0) ? 0.5 : 1 }}>
          Continuar →
        </button>
      </SurveyShell>
    );
  }

  if (phase === 'C') {
    return (
      <SurveyShell title="Sección C — Autoconciencia de sesgos" progress={60}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Indica qué tan de acuerdo estás con cada afirmación:</p>
        {SECTION_C.map((label, i) => (
          <LikertRow key={i} label={label} value={cAnswers[i]} onChange={v => { const n = [...cAnswers]; n[i] = v; setCAnswers(n); }} />
        ))}
        <button className="btn btn-primary" onClick={() => setPhase('D')} disabled={cAnswers.some(c => c === 0)} style={{ width: '100%', padding: '13px', marginTop: 8, opacity: cAnswers.some(c => c === 0) ? 0.5 : 1 }}>
          Continuar →
        </button>
      </SurveyShell>
    );
  }

  if (phase === 'D') {
    return (
      <SurveyShell title="Sección D — Tu experiencia con FinVise" progress={80}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>¿FinVise te ayudó a entender el mundo de las inversiones?</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setDRating(n)} style={{ width: 44, height: 44, borderRadius: 8, border: `2px solid ${dRating === n ? 'var(--gold)' : 'var(--border)'}`, background: dRating === n ? 'rgba(212,168,67,0.12)' : 'var(--bg-surface-raised)', color: dRating === n ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: dRating === n ? 700 : 400, cursor: 'pointer', fontSize: 14, fontFamily: 'JetBrains Mono, monospace' }}>
                {n}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-muted)' }}>
            <span>Para nada</span><span>Completamente</span>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 10 }}>
            ¿Qué concepto aprendiste que no conocías antes de usar FinVise?
          </label>
          <textarea
            maxLength={200}
            value={dLearned}
            onChange={e => setDLearned(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            style={{ width: '100%', background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'DM Sans, sans-serif', resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{dLearned.length}/200</div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>¿Recomendarías FinVise a alguien que quiera aprender sobre inversiones?</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Sí', 'No', 'Tal vez'].map(opt => (
              <button key={opt} onClick={() => setDRecommend(opt)} style={{ flex: 1, padding: '11px', borderRadius: 8, border: `2px solid ${dRecommend === opt ? 'var(--gold)' : 'var(--border)'}`, background: dRecommend === opt ? 'rgba(212,168,67,0.1)' : 'var(--bg-surface-raised)', color: dRecommend === opt ? 'var(--gold)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: dRecommend === opt ? 600 : 400 }}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || dRating === 0 || !dRecommend} style={{ width: '100%', padding: '14px', opacity: (dRating === 0 || !dRecommend) ? 0.5 : 1 }}>
          {submitting ? 'Enviando...' : 'Enviar encuesta →'}
        </button>
      </SurveyShell>
    );
  }

  if (phase === 'done') {
    const postOnly = surveyType === 'post';
    return (
      <SurveyShell title="¡Gracias!" progress={100}>
        <div className="fade-slide-up" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: 'var(--text-primary)', margin: '0 0 12px' }}>
            {postOnly ? '¡Gracias por tu participación!' : 'Encuesta completada'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
            {postOnly
              ? 'Tus respuestas contribuyen a mejorar FinVise como herramienta educativa. ¡Tu participación tiene impacto real!'
              : 'Tu encuesta de inicio ha sido registrada. Ahora empieza a explorar tu portafolio educativo.'}
          </p>

          {/* Score summary */}
          <div className="card" style={{ marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu puntaje — Sección A</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 48, color: 'var(--gold)' }}>{aScore}</span>
              <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/ 8 correctas</span>
            </div>
            {postOnly && comparison?.pre && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-surface-raised)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                Encuesta inicial: {comparison.pre.section_a_score}/8 →
                <span style={{ color: aScore > (comparison.pre.section_a_score ?? 0) ? 'var(--green)' : 'var(--text-muted)', marginLeft: 6, fontWeight: 700 }}>
                  {aScore > (comparison.pre.section_a_score ?? 0) ? `+${aScore - comparison.pre.section_a_score} preguntas correctas` : 'Sin cambio'}
                </span>
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '14px', fontSize: 15 }}>
            {postOnly ? 'Volver al dashboard' : 'Explorar mi portafolio educativo →'}
          </button>
        </div>
      </SurveyShell>
    );
  }

  return null;
}

function SurveyShell({ children, title, progress }: { children: React.ReactNode; title: string; progress: number }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', paddingBottom: 36 }}>
      <div style={{ padding: '20px 48px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--gold)' }}>F</span>invise <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>· Encuesta académica</span>
        </span>
      </div>
      <div style={{ height: 3, background: 'var(--bg-surface-raised)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', transition: 'width 400ms ease' }} />
      </div>
      <div style={{ flex: 1, maxWidth: 640, width: '100%', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--text-primary)', margin: '0 0 28px' }}>{title}</h1>
        {children}
      </div>
    </div>
  );
}
