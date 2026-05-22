import { useState, useEffect } from 'react';
import { getRecommendation } from '../services/api';
import type { Recommendation, RecommendationItem } from '../types';
import RecommendationCard from './RecommendationCard';
import type { AssetPreferences } from '../pages/Dashboard';
import { buildMockRecommendation, getMockReplacement } from '../mock/data';

interface Props {
  initialData: Recommendation | null;
  onItemsChange?: (items: RecommendationItem[]) => void;
  preferences?: AssetPreferences;
  riskScore?: number;
}

export default function ScenarioTabs({ initialData, onItemsChange, preferences = {}, riskScore = 7 }: Props) {
  const scenarios = [
    { label: 'Conservador', override: Math.max(1, riskScore - 3) },
    { label: 'Tu perfil',   override: riskScore },
    { label: 'Agresivo',    override: Math.min(10, riskScore + 3) },
  ];

  const [activeIdx, setActiveIdx] = useState(1);
  const [tabItems, setTabItems]   = useState<Record<number, RecommendationItem[]>>({});
  const [loading, setLoading]     = useState<Record<number, boolean>>({});
  const [replacing, setReplacing] = useState<Record<number, Set<string>>>({});
  const [excluded, setExcluded]   = useState<Record<number, string[]>>({});

  // Seed "Tu perfil" tab when initial data arrives
  useEffect(() => {
    if (initialData) {
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
      let data: Recommendation | null = null;
      try {
        data = await getRecommendation(scenarios[idx].override, { excludedTickers: excluded[idx] });
      } catch {
        // network / auth error — data stays null, handled below
      }
      // API success but empty payload, or API failure: both fall back to mock
      if (!data || !data.recommendations?.length) {
        data = buildMockRecommendation(scenarios[idx].override);
      }
      setTabItems(prev => ({ ...prev, [idx]: [...data!.recommendations] }));
    } finally {
      setLoading(prev => ({ ...prev, [idx]: false }));
    }
  }

  async function handleReplace(idx: number, ticker: string) {
    const currentItems = tabItems[idx] ?? [];
    const replacedItem = currentItems.find(i => i.ticker === ticker);

    // Mark card as loading
    setReplacing(prev => {
      const s = new Set(prev[idx] ?? []);
      s.add(ticker);
      return { ...prev, [idx]: s };
    });

    // Track dismissed tickers so they never come back
    const newExcluded = [...new Set([...(excluded[idx] ?? []), ticker])];
    setExcluded(prev => ({ ...prev, [idx]: newExcluded }));

    let replacement: RecommendationItem | null = null;

    try {
      // Exclude every ticker currently shown + dismissed ones so the API
      // returns a genuinely fresh alternative.
      const allExcluded = [...new Set([...newExcluded, ...currentItems.map(i => i.ticker)])];
      const data = await getRecommendation(scenarios[idx].override, { excludedTickers: allExcluded });
      replacement = data.recommendations[0] ?? null;
    } catch {
      // backend unavailable — handled below
    }

    // If API returned nothing or failed, pick from the local mock pool
    // (same asset class first, then any other class).
    if (!replacement) {
      const allExcluded = [...new Set([...newExcluded, ...currentItems.map(i => i.ticker)])];
      replacement = getMockReplacement(
        replacedItem?.asset_class ?? 'etf',
        allExcluded,
        replacedItem?.allocation_pct ?? 15,
        scenarios[idx].override,
      );
    }

    setTabItems(prev => {
      const items = prev[idx] ?? [];
      if (!replacement) {
        // Exhausted all alternatives — just remove the card
        return { ...prev, [idx]: items.filter(i => i.ticker !== ticker) };
      }
      return { ...prev, [idx]: items.map(i => i.ticker === ticker ? replacement! : i) };
    });

    setReplacing(prev => {
      const s = new Set(prev[idx] ?? []);
      s.delete(ticker);
      return { ...prev, [idx]: s };
    });
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
                initialSaved={preferences[item.ticker]?.saved}
                initialLiked={preferences[item.ticker]?.liked}
                initialDisliked={preferences[item.ticker]?.disliked}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
