/*import { useNavigate } from "react-router-dom";
import { Star, MapPin, Briefcase, Loader2, UserCheck, Clock } from "lucide-react";
import { cn } from "../../lib/utils";
import type { TutorSummary, ConnectionStatus } from "../../types/student.types";

interface TutorCardProps {
  tutor: TutorSummary;
  connectionStatus: ConnectionStatus | null;
  isSending: boolean;
  onConnect: (tutorId: string) => void;
}

const levelColors = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function TutorCard({
  tutor,
  connectionStatus,
  isSending,
  onConnect,
}: TutorCardProps) {
  const navigate = useNavigate();

  const initials = tutor.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderConnectButton = () => {
    if (connectionStatus === "accepted") {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
        >
          <UserCheck size={13} />
          Connected
        </button>
      );
    }
    if (connectionStatus === "pending") {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20"
        >
          <Clock size={13} />
          Pending
        </button>
      );
    }
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConnect(tutor.id);
        }}
        disabled={isSending}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
          "bg-morpheus-accent text-white transition-all",
          "hover:bg-morpheus-accent/90 disabled:opacity-60"
        )}
      >
        {isSending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          "Connect"
        )}
      </button>
    );
  };

  return (
    <div
      onClick={() => navigate(`/student/tutors/${tutor.id}`)}
      className={cn(
        "group relative rounded-2xl border border-morpheus-border bg-morpheus-surface",
        "p-5 cursor-pointer transition-all duration-200",
        "hover:border-morpheus-accent/30 hover:shadow-xl hover:shadow-morpheus-accent/5",
        "hover:-translate-y-0.5"
      )}
    >
      {/* Header */
    /*  <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */
        /*  <div className="w-11 h-11 rounded-xl bg-morpheus-accent/15 border border-morpheus-accent/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-morpheus-accent">
              {initials}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-morpheus-text font-display">
              {tutor.user.name}
            </h3>
            <p className="text-xs text-morpheus-muted mt-0.5 line-clamp-1">
              {tutor.degreeName || tutor.education}
            </p>
          </div>
        </div>
        {renderConnectButton()}
      </div>

    /*  {/* Rating + meta */
     /* <div className="flex items-center gap-3 mb-4 text-xs text-morpheus-muted">
        <span className="flex items-center gap-1">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-morpheus-text font-medium">
            {tutor.averageRating > 0
              ? (tutor.averageRating / 10).toFixed(1)
              : "New"}
          </span>
          {tutor.totalReviews > 0 && (
            <span>({tutor.totalReviews})</span>
          )}
        </span>
        {tutor.experienceYears > 0 && (
          <span className="flex items-center gap-1">
            <Briefcase size={12} />
            {tutor.experienceYears}y exp
          </span>
        )}
        {tutor.city && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {tutor.city}
          </span>
        )}
      </div>*/

   /*   {/* Subject tags */
     /* {tutor.subjects?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects.slice(0, 4).map((s) => (
            <span
              key={s.subjectId}
              className={cn(
                "text-xs px-2 py-0.5 rounded-md border font-medium",
                levelColors[s.level]
              )}
            >
              {s.subject.name}
            </span>
          ))}
          {tutor.subjects.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-md border border-morpheus-border text-morpheus-muted">
              +{tutor.subjects.length - 4}
            </span>
          )}
        </div>
    /*  )}

    /*  {/* Recommendation score */
    /*  {tutor.recommendationScore !== undefined && (
        <div className="mt-3 pt-3 border-t border-morpheus-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-morpheus-muted">Match score</span>
            <span className="text-xs font-medium text-morpheus-accent">
              {Math.round(tutor.recommendationScore * 100)}%
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full rounded-full bg-morpheus-border overflow-hidden">
            <div
              className="h-full bg-morpheus-accent rounded-full"
              style={{ width: `${Math.round(tutor.recommendationScore * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
/*}*/
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Briefcase, Loader2, UserCheck, Clock } from "lucide-react";
import { cn } from "../../lib/utils";
import type { TutorSummary, ConnectionStatus } from "../../types/student.types";

interface TutorCardProps {
  tutor: TutorSummary;
  connectionStatus: ConnectionStatus | null;
  isSending: boolean;
  onConnect: (tutorId: string) => void;
}

const levelColors = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function TutorCard({
  tutor,
  connectionStatus,
  isSending,
  onConnect,
}: TutorCardProps) {
  const navigate = useNavigate();

  // Safe name access — handle both nested and flat response shapes
  const name = tutor.user?.name ?? (tutor as any).name ?? "Tutor";

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderConnectButton = () => {
    if (connectionStatus === "accepted") {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
        >
          <UserCheck size={13} />
          Connected
        </button>
      );
    }
    if (connectionStatus === "pending") {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20"
        >
          <Clock size={13} />
          Pending
        </button>
      );
    }
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConnect(tutor.id);
        }}
        disabled={isSending}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
          "bg-morpheus-accent text-white transition-all",
          "hover:bg-morpheus-accent/90 disabled:opacity-60"
        )}
      >
        {isSending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          "Connect"
        )}
      </button>
    );
  };

  return (
    <div
      onClick={() => navigate(`/student/tutors/${tutor.id}`)}
      className={cn(
        "group relative rounded-2xl border border-morpheus-border bg-morpheus-surface",
        "p-5 cursor-pointer transition-all duration-200",
        "hover:border-morpheus-accent/30 hover:shadow-xl hover:shadow-morpheus-accent/5",
        "hover:-translate-y-0.5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-morpheus-accent/15 border border-morpheus-accent/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-morpheus-accent">
              {initials}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-morpheus-text font-display">
              {name}
            </h3>
            <p className="text-xs text-morpheus-muted mt-0.5 line-clamp-1">
              {tutor.degreeName || tutor.education}
            </p>
          </div>
        </div>
        {renderConnectButton()}
      </div>

      {/* Rating + meta */}
      <div className="flex items-center gap-3 mb-4 text-xs text-morpheus-muted">
        <span className="flex items-center gap-1">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-morpheus-text font-medium">
            {tutor.averageRating > 0
              ? (tutor.averageRating / 10).toFixed(1)
              : "New"}
          </span>
          {tutor.totalReviews > 0 && (
            <span>({tutor.totalReviews})</span>
          )}
        </span>
        {tutor.experienceYears > 0 && (
          <span className="flex items-center gap-1">
            <Briefcase size={12} />
            {tutor.experienceYears}y exp
          </span>
        )}
        {tutor.city && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {tutor.city}
          </span>
        )}
      </div>

      {/* Subject tags */}
      {tutor.subjects?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects.slice(0, 4).map((s) => (
            <span
              key={s.subjectId}
              className={cn(
                "text-xs px-2 py-0.5 rounded-md border font-medium",
                levelColors[s.level]
              )}
            >
              {s.subject?.name ?? s.subjectId}
            </span>
          ))}
          {tutor.subjects.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-md border border-morpheus-border text-morpheus-muted">
              +{tutor.subjects.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Recommendation score */}
      {tutor.recommendationScore !== undefined && (
        <div className="mt-3 pt-3 border-t border-morpheus-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-morpheus-muted">Match score</span>
            <span className="text-xs font-medium text-morpheus-accent">
              {Math.round(tutor.recommendationScore)}%
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full rounded-full bg-morpheus-border overflow-hidden">
            <div
              className="h-full bg-morpheus-accent rounded-full"
              style={{ width: `${Math.min(Math.round(tutor.recommendationScore), 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

