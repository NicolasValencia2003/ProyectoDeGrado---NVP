import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { MarketModule } from './market/market.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { EventsModule } from './events/events.module';
import { AlertsModule } from './alerts/alerts.module';
import { HistoryModule } from './history/history.module';
import { SurveyModule } from './survey/survey.module';
import { ChatModule } from './chat/chat.module';
import { BiasModule } from './bias/bias.module';
import { SupabaseAuthGuard } from './common/supabase-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    MarketModule,
    RecommendationsModule,
    EventsModule,
    AlertsModule,
    HistoryModule,
    SurveyModule,
    ChatModule,
    BiasModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
})
export class AppModule {}
