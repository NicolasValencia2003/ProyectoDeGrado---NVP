import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  save(@CurrentUser() user: any, @Body() body: any) {
    return this.surveyService.save(user.id, body);
  }

  @Get()
  get(@CurrentUser() user: any, @Query('type') type: string) {
    return this.surveyService.get(user.id, type ?? 'pre');
  }

  @Get('comparison')
  comparison(@CurrentUser() user: any) {
    return this.surveyService.getComparison(user.id);
  }
}
