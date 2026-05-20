import { SupabaseService } from '../supabase/supabase.service';
export declare class BiasDetectionService {
    private supabase;
    private readonly log;
    constructor(supabase: SupabaseService);
    analyzeUser(userId: string, userProfile: any): Promise<any>;
    private scoreRecency;
    private scoreFamiliarity;
    private scoreLossAversion;
    private scoreOverconfidence;
    private scoreDisposition;
    private buildEvidence;
}
