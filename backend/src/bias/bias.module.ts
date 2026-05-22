import { Module } from '@nestjs/common';
import { BiasController } from './bias.controller';
import { BiasDetectionService } from './bias-detection.service';

@Module({
  controllers: [BiasController],
  providers: [BiasDetectionService],
  exports: [BiasDetectionService],
})
export class BiasModule {}
