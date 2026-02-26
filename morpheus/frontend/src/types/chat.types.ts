export interface Conversation {
  id: string;
  lastMessageAt: string | null;
  participantId: string;
  participantUserId: string;
  participantName: string;
}

export type MessageType =
  | "text"
  | "schedule_request"
  | "schedule_response"
  | "session_link"
  | "system";

export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, any>;
  status: MessageStatus;
  isEdited: boolean;
  createdAt: string;
  editedAt?: string | null;
}
