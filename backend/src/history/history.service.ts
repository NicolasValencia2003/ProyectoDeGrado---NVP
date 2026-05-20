import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { MOCK_HISTORY, MOCK_PRICES } from '../mock/mock-data';

@Injectable()
export class HistoryService {
  constructor(private supabase: SupabaseService) {}

  async getEnriched(userId?: string): Promise<any[]> {
    let history: any[] = MOCK_HISTORY as any[];

    if (this.supabase.isConfigured() && userId) {
      try {
        const { data } = await this.supabase.db!
          .from('recommendation_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data?.length) history = data;
      } catch { /* fall through */ }
    }

    return history.map((entry: any) => ({
      ...entry,
      payload: {
        ...entry.payload,
        recommendations: (entry.payload?.recommendations ?? []).map((r: any) => {
          const current_price  = MOCK_PRICES[r.ticker]?.price ?? r.current_price ?? null;
          const price_at_rec   = r.price_at_rec ?? r.current_price ?? null;
          const performance_pct = current_price && price_at_rec
            ? Math.round(((current_price - price_at_rec) / price_at_rec) * 10000) / 100
            : null;
          return { ...r, current_price, performance_pct };
        }),
      },
    }));
  }
}
