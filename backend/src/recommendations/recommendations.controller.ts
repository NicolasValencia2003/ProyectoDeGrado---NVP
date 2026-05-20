import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { MockAuthGuard } from '../common/mock-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('recommendations')
@UseGuards(MockAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('generate')
  generate(@CurrentUser() user: any, @Body() body: { risk_override?: number; excluded_tickers?: string[] }) {
    return this.recommendationsService.generate(user, body.risk_override, body.excluded_tickers);
  }
}
