import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { MarketDataFetcherService } from '../market/market-data-fetcher.service';
import { BanditModule } from '../bandit/bandit.module';

@Module({
  imports:     [BanditModule],
  controllers: [RecommendationsController],
  providers:   [RecommendationsService, MarketDataFetcherService],
})
export class RecommendationsModule {}
