import { Module } from '@nestjs/common';
import { BiasController } from './bias.controller';
import { BiasDetectionService } from './bias-detection.service';
import { MockAuthGuard } from '../common/mock-auth.guard';

@Module({
  controllers: [BiasController],
  providers: [BiasDetectionService, MockAuthGuard],
  exports: [BiasDetectionService],
})
export class BiasModule {}
