import { format } from "date-fns";
import { Check, CheckCheck, Calendar, Clock } from "lucide-react";
import type { Message } from "../../types/chat.types";
import { cn } from "../../lib/utils";
import { useSocketStore } from "../../store/socket.store";

interface Props {
  message: Message;
  isMine: boolean;
  conversationId: string;
}

function StatusIcon({ status }: { status: Message["status"] }) {
  if (status === "read") return <CheckCheck size={12} className="text-morpheus-accent" />;
  if (status === "delivered") return <CheckCheck size={12} className="text-morpheus-muted" />;
  return <Check size={12} className="text-morpheus-muted" />;
}

function ScheduleRequestBubble({
  message,
  isMine,
  conversationId,
}: Props) {
  const { socket } = useSocketStore();
  const meta = message.metadata ?? {};
  const isPending = meta.status === "pending";

  const respond = (status: "accepted" | "rejected") => {
    socket?.emit("respond_to_schedule", {
      conversationId,
      messageId: message.id,
      status,
    });
  };

  return (
    <div className={cn(
      "rounded-2xl border p-4 max-w-sm",
      isMine
        ? "bg-morpheus-accent/10 border-morpheus-accent/20 ml-auto"
        : "bg-morpheus-surface border-morpheus-border"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={15} className="text-morpheus-accent shrink-0" />
        <span className="text-xs font-semibold text-morpheus-accent uppercase tracking-wide">
          Session Proposal
        </span>
      </div>
      <p className="text-sm text-morpheus-text mb-1">{meta.topic || "Tutoring session"}</p>
      {meta.scheduledAt && (
        <div className="flex items-center gap-1.5 text-xs text-morpheus-muted mb-3">
          <Clock size={12} />
          {format(new Date(meta.scheduledAt), "PPp")}
        </div>
      )}

      {/* Status badge */}
      {meta.status === "accepted" && (
        <span className="text-xs font-medium text-emerald-400">✅ Accepted</span>
      )}
      {meta.status === "rejected" && (
        <span className="text-xs font-medium text-red-400">❌ Declined</span>
      )}

      {/* Student can respond if pending and it's not their own message */}
      {isPending && !isMine && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => respond("rejected")}
            className="flex-1 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all"
          >
            Decline
          </button>
          <button
            onClick={() => respond("accepted")}
            className="flex-1 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all"
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
}

function ScheduleResponseBubble({ message }: { message: Message }) {
  const meta = message.metadata ?? {};
  const accepted = meta.status === "accepted";
  return (
    <div className={cn(
      "rounded-2xl border px-4 py-3 max-w-xs",
      accepted
        ? "bg-emerald-500/5 border-emerald-500/20"
        : "bg-red-500/5 border-red-500/20"
    )}>
      <p className="text-sm text-morpheus-text">{message.content}</p>
    </div>
  );
}

export default function MessageBubble({ message, isMine, conversationId }: Props) {
  const time = format(new Date(message.createdAt), "HH:mm");

  // Special message types
  if (message.type === "schedule_request") {
    return (
      <div className={cn("flex flex-col gap-1 mb-3", isMine ? "items-end" : "items-start")}>
        <ScheduleRequestBubble message={message} isMine={isMine} conversationId={conversationId} />
        <span className="text-xs text-morpheus-muted px-1">{time}</span>
      </div>
    );
  }

  if (message.type === "schedule_response") {
    return (
      <div className={cn("flex flex-col gap-1 mb-3", isMine ? "items-end" : "items-start")}>
        <ScheduleResponseBubble message={message} />
        <span className="text-xs text-morpheus-muted px-1">{time}</span>
      </div>
    );
  }

  if (message.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-morpheus-muted bg-morpheus-surface border border-morpheus-border px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // Regular text message
  return (
    <div className={cn("flex flex-col gap-1 mb-3 max-w-[75%]", isMine ? "items-end ml-auto" : "items-start")}>
      <div className={cn(
        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
        isMine
          ? "bg-morpheus-accent text-white rounded-br-sm"
          : "bg-morpheus-surface border border-morpheus-border text-morpheus-text rounded-bl-sm"
      )}>
        {message.content}
      </div>
      <div className={cn("flex items-center gap-1 px-1", isMine && "flex-row-reverse")}>
        <span className="text-xs text-morpheus-muted">{time}</span>
        {isMine && <StatusIcon status={message.status} />}
      </div>
    </div>
  );
}
