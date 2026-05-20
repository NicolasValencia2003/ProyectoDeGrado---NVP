import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    log(body: any, req: any): Promise<{
        ok: boolean;
    }>;
}
