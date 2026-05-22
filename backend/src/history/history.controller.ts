import { Controller, Get } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getAll(@CurrentUser() user: any) {
    return this.historyService.getEnriched(user?.id);
  }
}
