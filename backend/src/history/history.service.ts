import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class HistoryService {
  constructor(private supabase: SupabaseService) {}

  async getEnriched(userId?: string): Promise<any[]> {
    if (!this.supabase.isConfigured() || !userId) return [];

    try {
      const { data } = await this.supabase.db!
        .from('recommendation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!data?.length) return [];

      // Enrich with current prices from Supabase cache
      const { data: prices } = await this.supabase.db!.from('prices_cache').select('ticker, price');
      const priceMap: Record<string, number> = Object.fromEntries(
        (prices ?? []).map((p: any) => [p.ticker, p.price]),
      );

      return data.map((entry: any) => ({
        ...entry,
        payload: {
          ...entry.payload,
          recommendations: (entry.payload?.recommendations ?? []).map((r: any) => {
            const current_price  = priceMap[r.ticker] ?? r.current_price ?? null;
            const price_at_rec   = r.price_at_rec ?? r.current_price ?? null;
            const performance_pct = current_price && price_at_rec
              ? Math.round(((current_price - price_at_rec) / price_at_rec) * 10000) / 100
              : null;
            return { ...r, current_price, performance_pct };
          }),
        },
      }));
    } catch {
      return [];
    }
  }
}
