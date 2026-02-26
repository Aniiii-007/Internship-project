import { useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import SessionCard from "../../src/components/session/SessionCard";    //    ../../components/sessions/SessionCard
import { useSessions, useSessionActions } from "../../src/hooks/useSessions"; //     ../../hooks/useSessions
import type { Session } from "../types/session.types";   //     ../../types/session.types
import { cn } from "../lib/utils";           //       ../../lib/utils
import { useNavigate } from "react-router-dom";

type Tab = "upcoming" | "past";

interface Props {
  Layout: React.ComponentType<{ children: React.ReactNode; pendingCount?: number }>;
  role: "student" | "tutor";
  pendingCount?: number;
}

export default function SessionsPage({ Layout, role, pendingCount }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("upcoming");
  const { sessions, isLoading, error, refetch } = useSessions();
  const { start, complete, isLoading: actionLoading } = useSessionActions();
  const [actionId, setActionId] = useState<string | null>(null);

  const upcoming = sessions.filter((s) =>
    s.status === "scheduled" || s.status === "active"
  );
  const past = sessions.filter((s) =>
    s.status === "completed" || s.status === "cancelled"
  );

  const displayed = tab === "upcoming" ? upcoming : past;

  const handleStart = async (id: string) => {
    setActionId(id);
    try {
      const updated = await start(id);
      if (updated) {
        // Navigate to call page immediately
        navigate(`/call/${id}`);
      }
    } catch {
    } finally {
      setActionId(null);
      refetch();
    }
  };

  const handleComplete = async (id: string) => {
    setActionId(id);
    try {
      await complete(id);
      refetch();
    } finally {
      setActionId(null);
    }
  };

  return (
    <Layout pendingCount={pendingCount}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Sessions
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Your scheduled and past tutoring sessions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-morpheus-surface border border-morpheus-border rounded-xl p-1 w-fit">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t
                ? "bg-morpheus-bg text-morpheus-text shadow-sm"
                : "text-morpheus-muted hover:text-morpheus-text"
            )}
          >
            {t}
            <span className={cn(
              "ml-2 text-xs px-1.5 py-0.5 rounded-full",
              tab === t
                ? "bg-morpheus-accent/10 text-morpheus-accent"
                : "bg-morpheus-surface text-morpheus-muted"
            )}>
              {t === "upcoming" ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-morpheus-accent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <CalendarClock size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">
            {tab === "upcoming" ? "No upcoming sessions" : "No past sessions"}
          </p>
          <p className="text-morpheus-muted text-sm mt-1">
            {tab === "upcoming"
              ? role === "tutor"
                ? "Go to Messages and propose a session to a student."
                : "Sessions will appear here once your tutor schedules one."
              : "Completed sessions will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              role={role}
              onStart={handleStart}
              onComplete={handleComplete}
              isActionLoading={actionId === session.id && actionLoading}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
