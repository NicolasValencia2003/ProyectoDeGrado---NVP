import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
export declare class MockAuthGuard implements CanActivate {
    private supabase;
    constructor(supabase: SupabaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
