import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import ConversationList from "../../src/components/chat/ConversationList";  //    ../../components/chat/ConversationList
import ChatWindow from "../../src/components/chat/ChatWindow";      // ../../components/chat/ChatWindow
import { useConversations } from "../../src/hooks/useChat";         //    ../../hooks/useChat
import type { Conversation } from "../../src/types/chat.types";         //    ../../types/chat.types
import { cn } from "../../src/lib/utils";

interface Props {
  Layout: React.ComponentType<{ children: React.ReactNode; pendingCount?: number }>;
  role: "student" | "tutor";
  pendingCount?: number;
}

export default function ChatPage({ Layout, role, pendingCount }: Props) {
  const [searchParams] = useSearchParams();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [mobileShowMessages, setMobileShowMessages] = useState(false);

  const { conversations, isLoading } = useConversations();

  // Auto-select conversation if ?conversationId= is in URL
  useEffect(() => {
    const id = searchParams.get("conversationId");
    if (id && conversations.length > 0) {
      const found = conversations.find((c) => c.id === id);
      if (found) {
        setActiveConversation(found);
        setMobileShowMessages(true);
      }
    }
  }, [searchParams, conversations]);

  const handleSelect = (conv: Conversation) => {
    setActiveConversation(conv);
    setMobileShowMessages(true);
  };

  return (
    <Layout pendingCount={pendingCount}>
      <div className="h-[calc(100vh-48px)] lg:h-[calc(100vh-0px)] -m-6 flex">
        {/* Conversation sidebar */}
        <div className={cn(
          "w-full lg:w-80 shrink-0 border-r border-morpheus-border bg-morpheus-bg flex flex-col",
          mobileShowMessages && "hidden lg:flex"
        )}>
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-morpheus-border">
            <h2 className="font-display text-lg font-semibold text-morpheus-text">Messages</h2>
            <p className="text-xs text-morpheus-muted mt-0.5">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              isLoading={isLoading}
              activeId={activeConversation?.id ?? null}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* Chat window */}
        <div className={cn(
          "flex-1 flex flex-col",
          !mobileShowMessages && "hidden lg:flex"
        )}>
          {activeConversation ? (
            <>
              {/* Mobile back button */}
              <div className="lg:hidden px-4 py-2 border-b border-morpheus-border">
                <button
                  onClick={() => setMobileShowMessages(false)}
                  className="text-xs text-morpheus-accent hover:underline"
                >
                  ← Back to conversations
                </button>
              </div>
              <ChatWindow
                conversation={activeConversation}
                role={role}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-morpheus-surface border border-morpheus-border flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-morpheus-muted" />
              </div>
              <p className="text-morpheus-text font-medium">Select a conversation</p>
              <p className="text-sm text-morpheus-muted mt-1">
                Choose a conversation from the list to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
