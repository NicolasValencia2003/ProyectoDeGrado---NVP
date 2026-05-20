import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (token && this.supabase.isConfigured()) {
      const { data: { user } } = await this.supabase.db!.auth.getUser(token);
      if (user) {
        request.user = user;
        return true;
      }
    }

    request.user = { id: null, email: 'demo@finvise.edu' };
    return true;
  }
}
