import { Module } from '@nestjs/common';
import { BanditService } from './bandit.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports:   [SupabaseModule],
  providers: [BanditService],
  exports:   [BanditService],
})
export class BanditModule {}
