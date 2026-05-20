import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(body: {
        messages: {
            role: 'user' | 'assistant';
            content: string;
        }[];
    }): Promise<{
        reply: string;
    }>;
}
