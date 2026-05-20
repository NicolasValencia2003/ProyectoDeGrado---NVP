import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { MockAuthGuard } from '../common/mock-auth.guard';

@Module({ controllers: [AlertsController], providers: [AlertsService, MockAuthGuard] })
export class AlertsModule {}
