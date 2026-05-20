import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MockAuthGuard } from '../common/mock-auth.guard';

@Module({ controllers: [EventsController], providers: [EventsService, MockAuthGuard] })
export class EventsModule {}
