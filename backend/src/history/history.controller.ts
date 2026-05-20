import { Controller, Get, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { MockAuthGuard } from '../common/mock-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('history')
@UseGuards(MockAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getAll(@CurrentUser() user: any) {
    return this.historyService.getEnriched(user?.id);
  }
}
