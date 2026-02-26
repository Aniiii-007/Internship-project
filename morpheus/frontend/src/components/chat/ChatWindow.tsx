/*import { useEffect, useRef } from "react";
import { Loader2, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useMessages } from "../../hooks/useChat";
import { useAuthStore } from "../../store/auth.store";
import type { Conversation } from "../../types/chat.types";
import { cn } from "../../lib/utils";

interface Props {
  conversation: Conversation;
  role: "student" | "tutor";
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 mb-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-morpheus-muted animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-morpheus-muted">typing…</span>
    </div>
  );
}

export default function ChatWindow({ conversation, role }: Props) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isSending,
    isTyping,
    sendMessage,
    handleInputChange,
  } = useMessages(conversation.id);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */
 /*     <div className="flex items-center justify-between px-5 py-4 border-b border-morpheus-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-morpheus-accent/10 border border-morpheus-accent/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-morpheus-accent">
              {conversation.participantName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-morpheus-text">
              {conversation.participantName}
            </p>
            <p className="text-xs text-morpheus-muted capitalize">
              {role === "student" ? "Tutor" : "Student"}
            </p>
          </div>
        </div>

        {/* Video call button */
/*        <button
          onClick={() => navigate(`/${role}/sessions`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-morpheus-border text-morpheus-muted hover:text-morpheus-accent hover:border-morpheus-accent/40 text-xs font-medium transition-all"
        >
          <Video size={14} />
          Start call
        </button>
      </div>

      {/* Messages */
 /*     <div className="flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin text-morpheus-accent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-morpheus-surface border border-morpheus-border flex items-center justify-center mb-3">
              <span className="text-xl">👋</span>
            </div>
            <p className="text-sm font-medium text-morpheus-text">
              Say hello to {conversation.participantName}!
            </p>
            <p className="text-xs text-morpheus-muted mt-1">
              This is the beginning of your conversation.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.senderId === user?.id}
                conversationId={conversation.id}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */
 /*     <MessageInput
        onSend={sendMessage}
        onTyping={handleInputChange}
        disabled={isSending}
      />
    </div>
  );
}*///   The above code is written while building socket.io chat feature







///Below code is written while implementing schedule session feature inside the chats


import { useEffect, useRef, useState } from "react";
import { Loader2, Video, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ScheduleSessionModal from "../../components/session/ScheduleSessionModal";  //    ../sessions/ScheduleSessionModal
import { useMessages } from "../../hooks/useChat";
import { useAuthStore } from "../../store/auth.store";
import type { Conversation } from "../../types/chat.types";

interface Props {
  conversation: Conversation;
  role: "student" | "tutor";
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 mb-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-morpheus-muted animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-morpheus-muted">typing…</span>
    </div>
  );
}

export default function ChatWindow({ conversation, role }: Props) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const {
    messages,
    isLoading,
    isSending,
    isTyping,
    sendMessage,
    handleInputChange,
  } = useMessages(conversation.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const initials = conversation.participantName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-morpheus-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-morpheus-accent/10 border border-morpheus-accent/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-morpheus-accent">
              {initials}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-morpheus-text">
              {conversation.participantName}
            </p>
            <p className="text-xs text-morpheus-muted capitalize">
              {role === "student" ? "Tutor" : "Student"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Schedule session — tutor only */}
          {role === "tutor" && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-morpheus-accent/10 border border-morpheus-accent/20 text-morpheus-accent text-xs font-medium hover:bg-morpheus-accent/20 transition-all"
            >
              <CalendarPlus size={14} />
              Schedule Session
            </button>
          )}

          {/* Start call — tutor only (starts the session) */}
          {role === "tutor" && (
            <button
              onClick={() => navigate(`/tutor/sessions`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-morpheus-border text-morpheus-muted hover:text-morpheus-accent hover:border-morpheus-accent/40 text-xs font-medium transition-all"
            >
              <Video size={14} />
              Sessions
            </button>
          )}

          {/* Student — go to sessions */}
          {role === "student" && (
            <button
              onClick={() => navigate(`/student/sessions`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-morpheus-border text-morpheus-muted hover:text-morpheus-accent hover:border-morpheus-accent/40 text-xs font-medium transition-all"
            >
              <Video size={14} />
              Sessions
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin text-morpheus-accent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-morpheus-surface border border-morpheus-border flex items-center justify-center mb-3">
              <span className="text-xl">👋</span>
            </div>
            <p className="text-sm font-medium text-morpheus-text">
              Say hello to {conversation.participantName}!
            </p>
            <p className="text-xs text-morpheus-muted mt-1">
              This is the beginning of your conversation.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.senderId === user?.id}
                conversationId={conversation.id}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onTyping={handleInputChange}
        disabled={isSending}
      />

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <ScheduleSessionModal
          conversationId={conversation.id}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
}

