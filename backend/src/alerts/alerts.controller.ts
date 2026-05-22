import { Controller, Get, Patch, Param } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getAll(@CurrentUser() user: any) {
    return this.alertsService.getAll(user?.id ?? undefined);
  }

  @Patch(':conditionName/read')
  markRead(@Param('conditionName') conditionName: string, @CurrentUser() user: any) {
    return this.alertsService.markRead(conditionName, user?.id ?? undefined);
  }
}
