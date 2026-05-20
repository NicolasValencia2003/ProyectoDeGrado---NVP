import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { MockAuthGuard } from '../common/mock-auth.guard';

@Module({ controllers: [HistoryController], providers: [HistoryService, MockAuthGuard] })
export class HistoryModule {}
