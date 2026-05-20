import { SupabaseService } from '../supabase/supabase.service';
export declare class SurveyService {
    private supabase;
    constructor(supabase: SupabaseService);
    save(userId: string, dto: any): Promise<{
        ok: boolean;
    }>;
    get(userId: string, type: string): Promise<any>;
    getComparison(userId: string): Promise<{
        pre: any;
        post: any;
    }>;
}
