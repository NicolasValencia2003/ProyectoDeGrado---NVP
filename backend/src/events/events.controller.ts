import { Controller, Post, Body, Request } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  log(@Body() body: any, @Request() req: any) {
    return this.eventsService.log(body, req.user?.id ?? undefined);
  }
}
