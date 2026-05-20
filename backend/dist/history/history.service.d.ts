import { SupabaseService } from '../supabase/supabase.service';
export declare class HistoryService {
    private supabase;
    constructor(supabase: SupabaseService);
    getEnriched(userId?: string): Promise<any[]>;
}
