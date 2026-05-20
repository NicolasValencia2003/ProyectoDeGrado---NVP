import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class EventsService {
  constructor(private supabase: SupabaseService) {}

  async log(event: any, userId?: string): Promise<{ ok: boolean }> {
    console.log('Event:', event.event_type, event.asset_ticker);
    if (this.supabase.isConfigured() && userId) {
      const row: Record<string, any> = {
        user_id:       userId,
        event_type:    event.event_type,
        asset_ticker:  event.asset_ticker ?? null,
        asset_class:   event.asset_class  ?? null,
        sector:        event.sector       ?? null,
        dwell_seconds: event.dwell_seconds ?? null,
      };
      if (event.metadata != null) row.metadata = event.metadata;
      void this.supabase.db!.from('user_events').insert(row).then(({ error }) => {
        if (error && error.message.includes('metadata')) {
          // Column not yet migrated — retry without metadata
          delete row.metadata;
          void this.supabase.db!.from('user_events').insert(row);
        }
      });
    }
    return { ok: true };
  }
}
