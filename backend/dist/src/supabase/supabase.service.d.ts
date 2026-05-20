import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private client;
    constructor();
    get db(): SupabaseClient | null;
    isConfigured(): boolean;
}
