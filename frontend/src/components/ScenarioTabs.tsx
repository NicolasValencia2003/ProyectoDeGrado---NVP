import { useState, useEffect } from 'react';
import { getRecommendation } from '../services/api';
import type { Recommendation, RecommendationItem } from '../types';
import RecommendationCard from './RecommendationCard';

interface Props {
  initialData: Recommendation | null;
  onItemsChange?: (items: RecommendationItem[]) => void;
}

export default function ScenarioTabs({ initialData, onItemsChange }: Props) {
  const userScore = parseInt(localStorage.getItem('risk_score') || '7', 10);
  const scenarios = [
    { label: 'Conservador',    override: Math.max(1, userScore - 3) },
    { label: 'Tu perfil',      override: userScore },
    { label: 'Agresivo',       override: Math.min(10, userScore + 3) },
  ];

  const [activeIdx, setActiveIdx]   = useState(1);
  const [results, setResults]       = useState<Record<number, Recommendation>>({});
  const [tabItems, setTabItems]     = useState<Record<number, RecommendationItem[]>>({});
  const [loading, setLoading]       = useState<Record<number, boolean>>({});
  const [replacing, setReplacing]   = useState<Record<number, Set<string>>>({});
  const [excluded, setExcluded]     = useState<Record<number, string[]>>({});

  // Seed tab items when initial data arrives
  useEffect(() => {
    if (initialData) {
      setResults(prev => ({ ...prev, 1: initialData }));
      setTabItems(prev => ({ ...prev, 1: [...initialData.recommendations] }));
    }
  }, [initialData]);

  // Notify parent whenever the active tab's items change
  useEffect(() => {
    const items = tabItems[activeIdx];
    if (items?.length) onItemsChange?.(items);
  }, [tabItems, activeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadTab(idx: number) {
    setActiveIdx(idx);
    if (tabItems[idx]?.length) return;
    setLoading(prev => ({ ...prev, [idx]: true }));
    try {
      const data = await getRecommendation(scenarios[idx].override, { excludedTickers: excluded[idx] });
      setResults(prev => ({ ...prev, [idx]: data }));
      setTabItems(prev => ({ ...prev, [idx]: [...data.recommendations] }));
    } catch { /* ignore */ } finally {
      setLoading(prev => ({ ...prev, [idx]: false }));
    }
  }

  async function handleReplace(idx: number, ticker: string) {
    setReplacing(prev => {
      const s = new Set(prev[idx] ?? []);
      s.add(ticker);
      return { ...prev, [idx]: s };
    });

    const newExcluded = [...new Set([...(excluded[idx] ?? []), ticker])];
    setExcluded(prev => ({ ...prev, [idx]: newExcluded }));

    try {
      // Exclude ALL current tab tickers + dismissed ones so the backend
      // returns only genuinely fresh alternatives
      const currentTickers = (tabItems[idx] ?? []).map(i => i.ticker);
      const allExcluded = [...new Set([...newExcluded, ...currentTickers])];

      const data = await getRecommendation(scenarios[idx].override, { excludedTickers: allExcluded });
      const replacement = data.recommendations[0] ?? null;

      setTabItems(prev => {
        const items = prev[idx] ?? [];
        if (!replacement) return { ...prev, [idx]: items.filter(i => i.ticker !== ticker) };
        return { ...prev, [idx]: items.map(i => i.ticker === ticker ? replacement : i) };
      });
    } catch {
      setTabItems(prev => ({ ...prev, [idx]: (prev[idx] ?? []).filter(i => i.ticker !== ticker) }));
    } finally {
      setReplacing(prev => {
        const s = new Set(prev[idx] ?? []);
        s.delete(ticker);
        return { ...prev, [idx]: s };
      });
    }
  }

  const currentItems = tabItems[activeIdx] ?? [];
  const isLoading    = loading[activeIdx];
  const replacingSet = replacing[activeIdx] ?? new Set<string>();

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => loadTab(i)}
            style={{
              padding: '10px 20px', background: 'transparent', border: 'none',
              borderBottom: activeIdx === i ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeIdx === i ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 14,
              fontWeight: activeIdx === i ? 600 : 400,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 150ms ease', marginBottom: -1,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 150ms ease' }}>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⟳</div>
            Calculando escenario...
          </div>
        )}
        {!isLoading && currentItems.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {currentItems.map((item, i) => (
              <RecommendationCard
                key={`${activeIdx}-${item.ticker}`}
                item={item}
                index={i}
                replacing={replacingSet.has(item.ticker)}
                onReplace={(ticker) => handleReplace(activeIdx, ticker)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
