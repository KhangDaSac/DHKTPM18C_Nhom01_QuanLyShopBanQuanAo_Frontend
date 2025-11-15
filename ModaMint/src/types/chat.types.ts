// src/types/chat.types.ts

export const SenderType = {
    CUSTOMER: 'CUSTOMER',
    STAFF: 'STAFF',
    AI: 'AI'
} as const;

export type SenderTypeValue = typeof SenderType[keyof typeof SenderType];

export interface MessageRequest {
    content: string;
    senderType: SenderTypeValue;
}

export interface MessageResponse {
    id: number;
    content: string;
    timestamp: string; // ISO format from backend (LocalDateTime)
    senderType: SenderTypeValue;
}

export interface ConversationResponse {
    id: number;
    isActive: boolean;
}
