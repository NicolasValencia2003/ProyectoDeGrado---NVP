import { Controller, Get, Req } from '@nestjs/common';
import { BiasDetectionService } from './bias-detection.service';

@Controller('bias')
export class BiasController {
  constructor(private biasService: BiasDetectionService) {}

  @Get('analysis')
  async getAnalysis(@Req() req: any) {
    return this.biasService.analyzeUser(req.user?.id, req.user);
  }
}
