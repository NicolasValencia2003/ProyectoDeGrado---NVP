import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    getAll(user: any): Promise<any[]>;
    markRead(conditionName: string, user: any): Promise<void>;
}
