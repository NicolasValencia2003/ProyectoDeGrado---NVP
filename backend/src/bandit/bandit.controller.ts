import { Controller, Get } from '@nestjs/common';
import { BanditService } from './bandit.service';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('bandit')
export class BanditController {
  constructor(private bandit: BanditService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.bandit.getBanditProfile(user?.id ?? '');
  }
}
