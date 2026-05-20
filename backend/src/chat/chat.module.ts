import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MockAuthGuard } from '../common/mock-auth.guard';

@Module({ controllers: [ChatController], providers: [ChatService, MockAuthGuard] })
export class ChatModule {}
