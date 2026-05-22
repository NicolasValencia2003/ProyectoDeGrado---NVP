import { SupabaseService } from '../supabase/supabase.service';
export declare class AlertsService {
    private supabase;
    constructor(supabase: SupabaseService);
    getAll(userId?: string): Promise<any[]>;
    markRead(conditionName: string, userId?: string): Promise<void>;
}
