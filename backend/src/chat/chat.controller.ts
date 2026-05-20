import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MockAuthGuard } from '../common/mock-auth.guard';

@Controller('chat')
@UseGuards(MockAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  chat(@Body() body: { messages: { role: 'user' | 'assistant'; content: string }[] }) {
    return this.chatService.chat(body.messages ?? []);
  }
}
