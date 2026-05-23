import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AcademicDisclaimer() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleContinue() {
    if (!accepted || !user) return;
    setBusy(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      academic_disclaimer_accepted: true,
      academic_disclaimer_accepted_at: new Date().toISOString(),
    });
    await refreshProfile();
    navigate('/onboarding');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--gold)' }}>F</span>invise
          </span>
        </div>

        <h1 style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 36,
          color: 'var(--text-primary)',
          textAlign: 'center',
          margin: '0 0 8px',
        }}>
          Antes de empezar
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
          FinVise es una herramienta académica
        </p>

        {/* Disclaimer box */}
        <div style={{
          border: '2px solid var(--amber)',
          borderRadius: 12,
          padding: '28px 32px',
          background: 'rgba(245,158,11,0.05)',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>⚠</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Aviso importante
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, margin: '0 0 16px' }}>
            FinVise fue desarrollada como proyecto de grado de <strong>Ingeniería de Sistemas y Computación</strong> de la
            Pontificia Universidad Javeriana Cali.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, margin: '0 0 16px' }}>
            Su propósito es que <strong>APRENDAS</strong> sobre inversiones, no que inviertas dinero real.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, margin: '0 0 16px' }}>
            Las recomendaciones que verás son <strong>material educativo</strong> basado en datos reales del mercado.
            No son consejos financieros certificados.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
            Si tienes dinero real que quieres invertir, consulta a un asesor financiero registrado ante la
            <strong style={{ color: 'var(--text-primary)' }}> Superintendencia Financiera de Colombia</strong>.
          </p>
        </div>

        {/* Checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          cursor: 'pointer',
          padding: '16px 20px',
          borderRadius: 10,
          border: `2px solid ${accepted ? 'var(--green)' : 'var(--border)'}`,
          background: accepted ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)',
          marginBottom: 28,
          transition: 'all 150ms ease',
        }}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 1, accentColor: 'var(--green)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            Entiendo que FinVise es una herramienta educativa y <strong>no</strong> un asesor financiero.
            Las recomendaciones son material académico de la Pontificia Universidad Javeriana Cali.
          </span>
        </label>

        <button
          onClick={handleContinue}
          disabled={!accepted || busy}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 10,
            border: 'none',
            background: accepted ? 'var(--gold)' : 'var(--bg-surface-raised)',
            color: accepted ? '#0a0f1e' : 'var(--text-muted)',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif',
            cursor: accepted ? 'pointer' : 'not-allowed',
            transition: 'all 150ms ease',
          }}
        >
          Comenzar a aprender →
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>
          Pontificia Universidad Javeriana Cali · Ingeniería de Sistemas · 2026
        </p>
      </div>
    </div>
  );
}
