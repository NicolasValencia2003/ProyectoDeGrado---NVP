import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [busy, setBusy]       = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      if (!profile.academic_disclaimer_accepted) navigate('/disclaimer', { replace: true });
      else if (!profile.risk_score) navigate('/onboarding', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2,
    }));
    let animId: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.strokeStyle = 'rgba(30,45,69,0.4)'; ctx!.lineWidth = 1;
      for (let x = 0; x < canvas!.width; x += 60) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, canvas!.height); ctx!.stroke(); }
      for (let y = 0; y < canvas!.height; y += 60) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(canvas!.width, y); ctx!.stroke(); }
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas!.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.vy *= -1;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(212,168,67,0.15)'; ctx!.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // AuthContext onAuthStateChange handles redirect
    } catch (err: any) {
      setError(err.message ?? 'Error al autenticar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--gold)' }}>F</span>invise
        </span>
        <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>⚠ Material educativo académico</span>
      </nav>

      {/* Main: hero + auth form side by side */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 64, padding: '48px', flexWrap: 'wrap' }}>

        {/* Hero */}
        <div style={{ maxWidth: 480 }}>
          <div style={{ display: 'inline-block', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, fontSize: 12, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Proyecto de tesis · Javeriana Cali 2025
          </div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.15, color: 'var(--text-primary)', margin: '0 0 20px' }}>
            Aprende a invertir<br />
            <span style={{ color: 'var(--gold)' }}>con criterio propio.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
            FinVise es una herramienta educativa que te ayuda a entender tu perfil de riesgo, explorar activos financieros y reconocer sesgos cognitivos.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🧠', text: 'Detección de sesgos cognitivos (Kahneman)' },
              { icon: '📊', text: 'Recomendaciones explicadas por Claude AI' },
              { icon: '📚', text: 'Encuesta de impacto educativo pre/post' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>{f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Auth form */}
        <div className="card" style={{ width: '100%', maxWidth: 380, padding: '32px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, background: 'none', border: 'none', padding: '10px', fontSize: 14, fontWeight: mode === m ? 600 : 400,
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: mode === m ? '2px solid var(--gold)' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: -1,
              }}>
                {m === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Correo electrónico</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                style={{ width: '100%', background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Contraseña</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ width: '100%', background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
            {error && (
              <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(239,68,68,0.08)', borderRadius: 6, padding: '8px 12px' }}>
                {error}
              </div>
            )}
            {mode === 'register' && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Al crear una cuenta aceptas que tus datos de uso serán analizados con fines académicos.
              </p>
            )}
            <button type="submit" disabled={busy} className="btn btn-primary" style={{ padding: '12px', fontSize: 15, opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Cargando...' : mode === 'login' ? 'Ingresar →' : 'Crear cuenta →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
