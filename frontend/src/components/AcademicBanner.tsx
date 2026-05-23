export default function AcademicBanner() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 36,
      background: '#0d1117',
      borderTop: '1px solid #1a2236',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '0 16px',
    }}>
      <span style={{
        fontSize: 11,
        color: 'var(--gold)',
        fontFamily: 'DM Sans, sans-serif',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        ⚠ FinVise es material educativo académico — No es asesoramiento financiero &nbsp;|&nbsp;
        Pontificia Universidad Javeriana Cali · Ingeniería de Sistemas · 2026
      </span>
    </div>
  );
}
