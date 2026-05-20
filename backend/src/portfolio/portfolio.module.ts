import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { RiskEngineService } from './risk-engine.service';
import { UniverseFilterService } from './universe-filter.service';

@Module({
  providers: [PortfolioService, RiskEngineService, UniverseFilterService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
