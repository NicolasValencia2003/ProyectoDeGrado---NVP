import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Multi-Armed Bandit with UCB1 (Upper Confidence Bound) algorithm.
 *
 * Each asset ticker is an "arm". The agent learns which tickers each user
 * prefers by observing feedback events (rate_up, save, rate_down, dismiss)
 * and balances exploration vs. exploitation using the UCB1 formula:
 *
 *   score(i) = μ_i + C × √( ln(N) / n_i )
 *
 * where μ_i = mean reward for ticker i, n_i = times shown, N = total shows.
 * Tickers never shown (n_i = 0) get +∞ so they are always explored first.
 */
@Injectable()
export class BanditService {
  private readonly log = new Logger('BanditService');
  private readonly C   = Math.SQRT2; // exploration constant

  private readonly REWARDS: Record<string, number> = {
    rate_up:  1.0,
    save:     0.8,
    rate_down: -1.0,
    dismiss:  -0.5,
  };

  constructor(private supabase: SupabaseService) {}

  /**
   * Returns a UCB score for every ticker the user has interacted with.
   * Tickers absent from the map have never been shown → treat as +∞ (explore first).
   */
  async getScores(userId: string): Promise<Record<string, number>> {
    if (!this.supabase.isConfigured() || !userId) return {};

    try {
      const { data: events, error } = await this.supabase.db!
        .from('user_events')
        .select('event_type, asset_ticker')
        .eq('user_id', userId)
        .in('event_type', ['view', 'rate_up', 'rate_down', 'save', 'dismiss'])
        .not('asset_ticker', 'is', null);

      if (error || !events?.length) return {};

      // Aggregate per ticker
      const pulls:   Record<string, number> = {}; // n_i (views)
      const rewards: Record<string, number> = {}; // sum of rewards

      let totalPulls = 0;

      for (const ev of events) {
        const t = ev.asset_ticker as string;
        if (!t) continue;

        if (ev.event_type === 'view') {
          pulls[t]  = (pulls[t]  ?? 0) + 1;
          totalPulls++;
        } else {
          const r = this.REWARDS[ev.event_type] ?? 0;
          rewards[t] = (rewards[t] ?? 0) + r;
        }
      }

      // UCB1 scores
      const scores: Record<string, number> = {};

      for (const ticker of new Set([...Object.keys(pulls), ...Object.keys(rewards)])) {
        const n = pulls[ticker] ?? 0;
        if (n === 0) {
          // Has feedback but no view logged — treat as explored once
          scores[ticker] = (rewards[ticker] ?? 0);
        } else {
          const mu          = (rewards[ticker] ?? 0) / n;
          const exploration = totalPulls > 1
            ? this.C * Math.sqrt(Math.log(totalPulls) / n)
            : 0;
          scores[ticker] = mu + exploration;
        }
      }

      this.log.debug(`UCB scores computed for ${Object.keys(scores).length} tickers`);
      return scores;
    } catch (err) {
      this.log.warn('Bandit score error: ' + (err as Error).message);
      return {};
    }
  }

  /**
   * Returns a human-readable learning profile derived from the user's feedback events.
   * Used in the Trayectoria page to evidence OE3/OE5 for thesis evaluation.
   */
  async getBanditProfile(userId: string): Promise<{
    top_liked:             Array<{ ticker: string; net_reward: number; feedback_count: number }>;
    top_disliked:          Array<{ ticker: string; net_reward: number; feedback_count: number }>;
    total_feedback_events: number;
    total_tickers_seen:    number;
    personalization_pct:   number;
    positive_rate:         number;
  }> {
    const empty = { top_liked: [], top_disliked: [], total_feedback_events: 0, total_tickers_seen: 0, personalization_pct: 0, positive_rate: 0 };
    if (!this.supabase.isConfigured() || !userId) return empty;

    try {
      const { data: events, error } = await this.supabase.db!
        .from('user_events')
        .select('event_type, asset_ticker')
        .eq('user_id', userId)
        .in('event_type', ['view', 'rate_up', 'rate_down', 'save', 'dismiss'])
        .not('asset_ticker', 'is', null);

      if (error || !events?.length) return empty;

      const rewards: Record<string, number> = {};
      const counts:  Record<string, number> = {};
      let totalFeedback = 0;
      let positiveFeedback = 0;

      for (const ev of events) {
        const t = ev.asset_ticker as string;
        if (!t || ev.event_type === 'view') continue;
        const r = this.REWARDS[ev.event_type] ?? 0;
        rewards[t] = (rewards[t] ?? 0) + r;
        counts[t]  = (counts[t]  ?? 0) + 1;
        totalFeedback++;
        if (r > 0) positiveFeedback++;
      }

      const tickers = Object.keys(rewards);
      const profile = tickers.map(ticker => ({
        ticker,
        net_reward:     Math.round(rewards[ticker] * 100) / 100,
        feedback_count: counts[ticker] ?? 0,
      })).sort((a, b) => b.net_reward - a.net_reward);

      return {
        top_liked:             profile.filter(p => p.net_reward > 0).slice(0, 4),
        top_disliked:          profile.filter(p => p.net_reward < 0).slice(0, 4),
        total_feedback_events: totalFeedback,
        total_tickers_seen:    new Set(events.filter(e => e.event_type === 'view').map(e => e.asset_ticker)).size,
        personalization_pct:   Math.min(Math.round((totalFeedback / 20) * 100), 100),
        positive_rate:         totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0,
      };
    } catch (err) {
      this.log.warn('Bandit profile error: ' + (err as Error).message);
      return empty;
    }
  }

  /**
   * Sorts a list of tickers by UCB score descending.
   * Tickers not in ucbScores (never shown) are placed first — they must be explored.
   */
  rank(tickers: string[], ucbScores: Record<string, number>): string[] {
    return [...tickers].sort((a, b) => {
      const sa = ucbScores[a] ?? Infinity; // never shown → explore first
      const sb = ucbScores[b] ?? Infinity;
      if (sa === Infinity && sb === Infinity) return 0; // both unseen → keep original order
      if (sa === Infinity) return -1;
      if (sb === Infinity) return  1;
      return sb - sa; // higher UCB score first
    });
  }
}
