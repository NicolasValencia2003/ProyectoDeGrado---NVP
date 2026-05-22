import { SupabaseService } from '../supabase/supabase.service';
export declare class EventsService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    log(event: any, userId?: string): Promise<{
        ok: boolean;
    }>;
    private fallbackUpdatePreferences;
}
