import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MockAuthGuard } from '../common/mock-auth.guard';
import { BiasDetectionService } from './bias-detection.service';

@Controller('bias')
@UseGuards(MockAuthGuard)
export class BiasController {
  constructor(private biasService: BiasDetectionService) {}

  @Get('analysis')
  async getAnalysis(@Req() req: any) {
    return this.biasService.analyzeUser(req.user?.id, req.user);
  }
}
