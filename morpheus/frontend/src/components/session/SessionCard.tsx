import { format, isPast, isWithinInterval, addMinutes } from "date-fns";
import { Calendar, Clock, BookOpen, Video, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Session } from "../../types/session.types";
import { cn } from "../../lib/utils";

interface Props {
  session: Session;
  role: "student" | "tutor";
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  isActionLoading?: boolean;
}

function StatusBadge({ status }: { status: Session["status"] }) {
  const config = {
    scheduled: { label: "Scheduled", class: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    active:    { label: "Live Now",  class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 animate-pulse" },
    completed: { label: "Completed", class: "text-morpheus-muted bg-morpheus-surface border-morpheus-border" },
    cancelled: { label: "Cancelled", class: "text-red-400 bg-red-400/10 border-red-400/20" },
  };
  const c = config[status] ?? config.scheduled;
  return (
    <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", c.class)}>
      {c.label}
    </span>
  );
}

export default function SessionCard({ session, role, onStart, onComplete, isActionLoading }: Props) {
  const navigate = useNavigate();
  const scheduledDate = new Date(session.scheduledAt);
  const isUpcoming = !isPast(scheduledDate);

  // Session is "joinable" if active OR within 15 min of scheduled time
  const isJoinable =
    session.status === "active" ||
    (session.status === "scheduled" &&
      isWithinInterval(new Date(), {
        start: addMinutes(scheduledDate, -15),
        end: addMinutes(scheduledDate, 60),
      }));

  const handleJoin = () => {
    navigate(`/call/${session.id}`);
  };

  return (
    <div className={cn(
      "rounded-2xl border bg-morpheus-surface p-5 transition-all",
      session.status === "active"
        ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5"
        : "border-morpheus-border"
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={session.status} />
          </div>
          <h3 className="font-display font-semibold text-morpheus-text truncate">
            {session.topic || "Tutoring Session"}
          </h3>
          {session.subjectName && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-morpheus-muted">
              <BookOpen size={12} />
              {session.subjectName}
            </div>
          )}
        </div>
      </div>

      {/* Date/time */}
      <div className="flex items-center gap-4 text-sm text-morpheus-muted mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {format(scheduledDate, "EEE, MMM d")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {format(scheduledDate, "h:mm a")}
        </span>
        {session.tutorName && (
          <span className="text-xs">with {session.tutorName}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Active — both can join */}
        {session.status === "active" && (
          <button
            onClick={handleJoin}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-500/90 transition-all"
          >
            <Video size={15} />
            Join Now
          </button>
        )}

        {/* Scheduled + joinable window — tutor starts, student waits */}
        {session.status === "scheduled" && isJoinable && role === "tutor" && (
          <button
            onClick={() => onStart?.(session.id)}
            disabled={isActionLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-morpheus-accent text-white text-sm font-medium hover:bg-morpheus-accent/90 transition-all disabled:opacity-60"
          >
            {isActionLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Video size={15} />
            )}
            Start Session
          </button>
        )}

        {session.status === "scheduled" && isJoinable && role === "student" && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-morpheus-border text-sm text-morpheus-muted">
            <Clock size={15} />
            Waiting for tutor to start...
          </div>
        )}

        {/* Active — tutor can complete */}
        {session.status === "active" && role === "tutor" && (
          <button
            onClick={() => onComplete?.(session.id)}
            disabled={isActionLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-morpheus-border text-sm text-morpheus-muted hover:text-red-400 hover:border-red-400/30 transition-all"
          >
            {isActionLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCircle size={15} />
            )}
            End
          </button>
        )}

        {/* Completed */}
        {session.status === "completed" && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-morpheus-muted">
            <CheckCircle size={14} className="text-emerald-400" />
            Session completed
          </div>
        )}
      </div>
    </div>
  );
}
