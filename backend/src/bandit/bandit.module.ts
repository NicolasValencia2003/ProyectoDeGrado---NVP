import { Module } from '@nestjs/common';
import { BanditService } from './bandit.service';
import { BanditController } from './bandit.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports:     [SupabaseModule],
  controllers: [BanditController],
  providers:   [BanditService],
  exports:     [BanditService],
})
export class BanditModule {}
