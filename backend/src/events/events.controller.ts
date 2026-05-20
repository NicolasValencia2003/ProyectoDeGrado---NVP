import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MockAuthGuard } from '../common/mock-auth.guard';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(MockAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  log(@Body() body: any, @Request() req: any) {
    return this.eventsService.log(body, req.user?.id ?? undefined);
  }
}
