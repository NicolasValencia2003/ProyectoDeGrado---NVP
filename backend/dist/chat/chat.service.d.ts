export declare class ChatService {
    private anthropic;
    constructor();
    chat(messages: {
        role: 'user' | 'assistant';
        content: string;
    }[]): Promise<{
        reply: string;
    }>;
}
