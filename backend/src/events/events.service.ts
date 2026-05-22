import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

// Event types that modify the ticker preference arrays in user_preferences.
const PREFERENCE_EVENTS = new Set(['rate_up', 'rate_down', 'save', 'unsave']);

@Injectable()
export class EventsService {
  private readonly logger = new Logger('EventsService');

  constructor(private supabase: SupabaseService) {}

  async log(event: any, userId?: string): Promise<{ ok: boolean }> {
    if (!this.supabase.isConfigured() || !userId) return { ok: true };

    const db = this.supabase.db!;

    // 1. Insert the raw event row.
    const { error: evErr } = await db.from('user_events').insert({
      user_id:       userId,
      event_type:    event.event_type,
      asset_ticker:  event.asset_ticker  ?? null,
      asset_class:   event.asset_class   ?? null,
      sector:        event.sector        ?? null,
      dwell_seconds: event.dwell_seconds ?? null,
      metadata:      event.metadata      ?? null,
    });
    if (evErr) this.logger.warn(`Event insert failed [${event.event_type}]: ${evErr.message}`);

    // 2. Keep user_preferences in sync — atomic upsert via PostgreSQL function.
    //    Falls back to a JS read-then-upsert if the migration hasn't been applied.
    const ticker = event.asset_ticker ?? null;
    const { error: rpcErr } = await db.rpc('upsert_user_preference', {
      p_user_id:    userId,
      p_event_type: event.event_type,
      p_ticker:     ticker,
    });

    if (rpcErr) {
      this.logger.warn(`upsert_user_preference RPC unavailable, using fallback: ${rpcErr.message}`);
      await this.fallbackUpdatePreferences(userId, event.event_type, ticker);
    }

    return { ok: true };
  }

  private async fallbackUpdatePreferences(
    userId: string,
    eventType: string,
    ticker: string | null,
  ): Promise<void> {
    try {
      const db = this.supabase.db!;

      const { data: current } = await db
        .from('user_preferences')
        .select('event_count, avoided_tickers, preferred_tickers')
        .eq('user_id', userId)
        .single();

      const eventCount      = (current?.event_count      ?? 0) + 1;
      const avoided:   string[] = [...(current?.avoided_tickers   ?? [])];
      const preferred: string[] = [...(current?.preferred_tickers ?? [])];

      if (ticker && PREFERENCE_EVENTS.has(eventType)) {
        if (eventType === 'rate_down') {
          if (!avoided.includes(ticker))   avoided.push(ticker);
          const pi = preferred.indexOf(ticker);
          if (pi > -1) preferred.splice(pi, 1);
        } else if (eventType === 'rate_up') {
          if (!preferred.includes(ticker)) preferred.push(ticker);
          const ai = avoided.indexOf(ticker);
          if (ai > -1) avoided.splice(ai, 1);
        } else if (eventType === 'save') {
          if (!preferred.includes(ticker)) preferred.push(ticker);
        } else if (eventType === 'unsave') {
          const pi = preferred.indexOf(ticker);
          if (pi > -1) preferred.splice(pi, 1);
        }
      }

      const { error } = await db.from('user_preferences').upsert(
        {
          user_id:          userId,
          event_count:      eventCount,
          avoided_tickers:  avoided,
          preferred_tickers: preferred,
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      if (error) this.logger.warn(`Fallback prefs upsert failed: ${error.message}`);
    } catch (err) {
      this.logger.warn(`Fallback prefs update error: ${(err as Error).message}`);
    }
  }
}
