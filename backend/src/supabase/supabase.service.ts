import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_KEY ?? '';
    if (url && key && !url.includes('your-project')) {
      this.client = createClient(url, key);
    }
  }

  get db(): SupabaseClient | null {
    return this.client;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
