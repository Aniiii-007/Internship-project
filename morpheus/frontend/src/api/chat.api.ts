import api from "./axios";
import type { Conversation, Message } from "../types/chat.types";

export const chatApi = {
  /** GET /api/chat/conversations */
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get("/api/chat/conversations");
    return response.data;
  },

  /** POST /api/chat/conversations — get or create conversation with a tutor */
  getOrCreateConversation: async (tutorId: string): Promise<{ id: string }> => {
    const response = await api.post("/api/chat/conversations", { tutorId });
    return response.data;
  },

  /** GET /api/chat/messages/:conversationId */
  getMessages: async (conversationId: string, page = 1): Promise<Message[]> => {
    const response = await api.get(`/api/chat/messages/${conversationId}`, {
      params: { page, limit: 50 },
    });
    return response.data;
  },

  /** PATCH /api/chat/messages/:conversationId/read */
  markAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/api/chat/messages/${conversationId}/read`);
  },
};
