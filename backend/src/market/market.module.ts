import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { MarketDataFetcherService } from './market-data-fetcher.service';

@Module({ controllers: [MarketController], providers: [MarketService, MarketDataFetcherService] })
export class MarketModule {}
