// src/services/chat/chat.service.ts
import type { ApiResponse } from '@/types';
import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type {
    ChatAiResponse,
    ChatAiRequest
} from '../../types/chat.types';


class ChatService {
    async getHistory(): Promise<ChatAiResponse[]> {
        const response = await apiClient.get<ApiResponse<ChatAiResponse[]>>(
            API_ENDPOINTS.CHAT.HISTORY()
        );
        return response.data.result;
    }

    async sendMessageToAI(content: string): Promise<ChatAiResponse> {
        const request: ChatAiRequest = {
            message: content
        };
        const response = await apiClient.post<ApiResponse<ChatAiResponse>>(
            API_ENDPOINTS.CHAT.CHAT(),
            request
        );
        return response.data.result;
    }
}

export const chatService = new ChatService();
export default chatService;