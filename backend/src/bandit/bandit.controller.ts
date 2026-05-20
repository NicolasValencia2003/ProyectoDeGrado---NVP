import { Controller, Get, UseGuards } from '@nestjs/common';
import { BanditService } from './bandit.service';
import { MockAuthGuard } from '../common/mock-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('bandit')
@UseGuards(MockAuthGuard)
export class BanditController {
  constructor(private bandit: BanditService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.bandit.getBanditProfile(user?.id ?? '');
  }
}
