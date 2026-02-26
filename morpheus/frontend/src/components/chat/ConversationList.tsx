import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Loader2 } from "lucide-react";
import type { Conversation } from "../../types/chat.types";
import { cn } from "../../lib/utils";

interface Props {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(date: string | null) {
  if (!date) return "";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

export default function ConversationList({ conversations, isLoading, activeId, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={20} className="animate-spin text-morpheus-accent" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
        <MessageSquare size={28} className="text-morpheus-border mb-2" />
        <p className="text-sm text-morpheus-muted">No conversations yet</p>
        <p className="text-xs text-morpheus-muted/60 mt-1">
          Connect with a tutor to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-morpheus-border">
      {conversations.map((conv) => {
        const initials = getInitials(conv.participantName);
        const isActive = conv.id === activeId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-morpheus-surface/80 w-full",
              isActive && "bg-morpheus-surface border-l-2 border-morpheus-accent"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold",
              isActive
                ? "bg-morpheus-accent/20 border border-morpheus-accent/30 text-morpheus-accent"
                : "bg-morpheus-surface border border-morpheus-border text-morpheus-muted"
            )}>
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isActive ? "text-morpheus-text" : "text-morpheus-text/80"
                )}>
                  {conv.participantName}
                </p>
                {conv.lastMessageAt && (
                  <span className="text-xs text-morpheus-muted shrink-0">
                    {timeAgo(conv.lastMessageAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-morpheus-muted mt-0.5">
                {conv.lastMessageAt ? "Last message" : "No messages yet"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
