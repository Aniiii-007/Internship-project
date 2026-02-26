import { useState, useEffect, useCallback, useRef } from "react";
import { chatApi } from "../api/chat.api";
import { useSocketStore } from "../store/socket.store";
import { useAuthStore } from "../store/auth.store";
import type { Conversation, Message } from "../types/chat.types";

// ─── useSocketInit ─────────────────────────────────────────────────────────────
// Call this once at app level to initialize socket when user is logged in

export function useSocketInit() {
  const { connect, disconnect } = useSocketStore();
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect(accessToken);
    } else {
      disconnect();
    }
    return () => {};
  }, [isAuthenticated, accessToken]);
}

// ─── useConversations ──────────────────────────────────────────────────────────

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, []);

  // Listen for new messages to re-sort conversations
  const { socket } = useSocketStore();
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessageAt: msg.createdAt }
            : c
        ).sort((a, b) =>
          new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
        )
      );
    };
    socket.on("new_message", handler);
    return () => { socket.off("new_message", handler); };
  }, [socket]);

  return { conversations, isLoading, error, refetch: fetch };
}

// ─── useMessages ───────────────────────────────────────────────────────────────

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocketStore();
  const { user } = useAuthStore();
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch messages + join room
  useEffect(() => {
    if (!conversationId) return;
    setIsLoading(true);

    chatApi
      .getMessages(conversationId)
      .then((data) => {
        setMessages(data);
        chatApi.markAsRead(conversationId).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    socket?.emit("join_conversation", conversationId);
  }, [conversationId, socket]);

  // Listen for new messages in this conversation
  useEffect(() => {
    if (!socket || !conversationId) return;

    const onNewMessage = (msg: Message) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => {
        // avoid duplicates
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // mark as read if we're looking at this conversation
      chatApi.markAsRead(conversationId).catch(() => {});
    };

    const onTyping = ({ userId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
      if (userId !== user?.id) setIsTyping(typing);
    };

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onTyping);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onTyping);
    };
  }, [socket, conversationId, user?.id]);

  // Send message via socket
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !conversationId || !content.trim()) return;
      setIsSending(true);
      socket.emit("send_message", { conversationId, content: content.trim(), type: "text" });
      // optimistic: isSending resets when new_message arrives
      setTimeout(() => setIsSending(false), 500);
    },
    [socket, conversationId]
  );

  // Emit typing indicator
  const emitTyping = useCallback(
    (typing: boolean) => {
      if (!socket || !conversationId) return;
      socket.emit("typing", { conversationId, isTyping: typing });
    },
    [socket, conversationId]
  );

  const handleInputChange = useCallback(() => {
    emitTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
  }, [emitTyping]);

  return {
    messages,
    isLoading,
    isSending,
    isTyping,
    sendMessage,
    handleInputChange,
  };
}

// ─── useStartConversation ──────────────────────────────────────────────────────
// Used on tutor profile page: student clicks "Message" button

export function useStartConversation() {
  const [isLoading, setIsLoading] = useState(false);

  const start = async (tutorId: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const conv = await chatApi.getOrCreateConversation(tutorId);
      return conv.id;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { start, isLoading };
}
