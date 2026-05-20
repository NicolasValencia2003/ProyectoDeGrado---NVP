import { useState, useMemo } from 'react';
import { GLOSSARY, CATEGORIES, type GlossaryTerm } from '../data/glossary';

function TermCard({ term }: { term: GlossaryTerm }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORIES[term.category];
  return (
    <div
      className="card"
      style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 20, marginBottom: 6,
            background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}40`,
          }}>
            {cat.label}
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            {term.term}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6,
            ...(expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>
            {term.definition}
          </p>
        </div>
        <span style={{ fontSize: 18, color: 'var(--text-muted)', flexShrink: 0, marginTop: 4 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 8, padding: '12px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Ejemplo
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
              {term.example}
            </p>
          </div>
          {term.related.length > 0 && (
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 8 }}>Relacionado:</span>
              {term.related.map(r => (
                <span key={r} style={{
                  fontSize: 11, padding: '2px 10px', borderRadius: 20, marginRight: 6,
                  background: 'var(--bg-surface-raised)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}>{r}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Glossary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<GlossaryTerm['category'] | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return GLOSSARY.filter(t =>
      (activeCategory === 'all' || t.category === activeCategory) &&
      (t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q))
    );
  }, [search, activeCategory]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: GLOSSARY.length };
    for (const t of GLOSSARY) c[t.category] = (c[t.category] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Glosario financiero
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px' }}>
          {GLOSSARY.length} conceptos clave del mundo de las inversiones, en español
        </p>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar término..."
          style={{
            width: '100%', maxWidth: 400, padding: '10px 16px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg-surface)',
            color: 'var(--text-primary)', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', border: '1px solid var(--border)',
            background: activeCategory === 'all' ? 'var(--gold)' : 'transparent',
            color: activeCategory === 'all' ? '#0a0f1e' : 'var(--text-secondary)',
          }}
        >
          Todos ({counts.all})
        </button>
        {(Object.entries(CATEGORIES) as [GlossaryTerm['category'], { label: string; color: string }][]).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', border: `1px solid ${cat.color}40`,
              background: activeCategory === key ? `${cat.color}20` : 'transparent',
              color: activeCategory === key ? cat.color : 'var(--text-muted)',
            }}
          >
            {cat.label} ({counts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No se encontraron términos que coincidan con "{search}"</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filtered.map(term => <TermCard key={term.term} term={term} />)}
        </div>
      )}

      <div style={{ marginTop: 40, padding: '20px 24px', background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>
          📚 Este glosario es material educativo de la <strong style={{ color: 'var(--text-secondary)' }}>Pontificia Universidad Javeriana Cali</strong>.
          Los conceptos presentados tienen propósito pedagógico y no constituyen asesoramiento financiero personalizado.
        </p>
      </div>
    </div>
  );
}
