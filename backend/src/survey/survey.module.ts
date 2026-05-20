import { Module } from '@nestjs/common';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { MockAuthGuard } from '../common/mock-auth.guard';

@Module({ controllers: [SurveyController], providers: [SurveyService, MockAuthGuard] })
export class SurveyModule {}
