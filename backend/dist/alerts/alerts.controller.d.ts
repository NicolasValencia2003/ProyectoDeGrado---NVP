import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    getAll(): any;
    markRead(id: string, user: any): any;
}
