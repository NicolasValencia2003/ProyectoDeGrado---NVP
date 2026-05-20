import { Controller, Get } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('prices')
  async getPrices() { return this.marketService.getPrices(); }

  @Get('sentiment')
  async getSentiment() { return this.marketService.getSentiment(); }
}
