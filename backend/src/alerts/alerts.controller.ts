import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { MockAuthGuard } from '../common/mock-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('alerts')
@UseGuards(MockAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getAll() { return this.alertsService.getAll(); }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.alertsService.markRead(+id, user.id);
  }
}
