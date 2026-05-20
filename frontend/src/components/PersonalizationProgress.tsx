interface Props { eventCount: number; }

export default function PersonalizationProgress({ eventCount }: Props) {
  const pct = Math.min(100, (eventCount / 20) * 100);

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Personalization</span>
        {eventCount >= 20 ? (
          <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✓ Fully personalized</span>
        ) : eventCount >= 5 ? (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{eventCount}/20 interactions</span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Building your profile...</span>
        )}
      </div>
      <div style={{ height: 6, background: 'var(--bg-surface-raised)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: eventCount >= 20 ? 'var(--green)' : 'var(--gold)',
          borderRadius: 3,
          transition: 'width 600ms ease-out',
        }} />
      </div>
      {eventCount >= 5 && eventCount < 20 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          Your recommendations become more personal as you explore.
        </p>
      )}
    </div>
  );
}
