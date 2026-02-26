import { useState } from "react";
import { Check, X, Loader2, Clock, Users, UserCheck, UserX } from "lucide-react";
import TutorLayout from "../../components/shared/TutorLayout";
import { useTutorConnections } from "../../hooks/useTutor";
import { cn } from "../../lib/utils";

type TabType = "pending" | "accepted" | "rejected";

function ConnectionCard({
  conn,
  onAccept,
  onReject,
  actionLoadingId,
}: {
  conn: any;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  actionLoadingId: string | null;
}) {
  const studentName = conn.student?.user?.name ?? conn.studentName ?? "Student";
  const studentEmail = conn.student?.user?.email ?? conn.studentEmail ?? "";
  const grade = conn.student?.studentProfile?.grade ?? conn.grade ?? null;
  const school = conn.student?.studentProfile?.schoolName ?? conn.schoolName ?? null;

  const initials = studentName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isLoading = actionLoadingId === conn.id;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-morpheus-border bg-morpheus-surface px-5 py-4 transition-all hover:border-morpheus-accent/20">
      {/* Avatar */}
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm",
        conn.status === "accepted"
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          : conn.status === "rejected"
          ? "bg-red-500/10 border border-red-500/20 text-red-400"
          : "bg-morpheus-accent/10 border border-morpheus-accent/20 text-morpheus-accent"
      )}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-morpheus-text">{studentName}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-morpheus-muted flex-wrap">
          {studentEmail && <span>{studentEmail}</span>}
          {grade && <span className="before:content-['·'] before:mr-2">{grade}</span>}
          {school && <span className="before:content-['·'] before:mr-2">{school}</span>}
        </div>
        <p className="text-xs text-morpheus-muted mt-1">
          {new Date(conn.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
          })}
        </p>
      </div>

      {/* Actions */}
      {conn.status === "pending" && onAccept && onReject && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onReject(conn.id)}
            disabled={isLoading}
            className="w-9 h-9 rounded-xl border border-morpheus-border text-morpheus-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 flex items-center justify-center transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={16} />}
          </button>
          <button
            onClick={() => onAccept(conn.id)}
            disabled={isLoading}
            className="w-9 h-9 rounded-xl bg-morpheus-accent/10 border border-morpheus-accent/30 text-morpheus-accent hover:bg-morpheus-accent hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
          </button>
        </div>
      )}

      {conn.status === "accepted" && (
        <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg">
          <UserCheck size={13} />
          Accepted
        </span>
      )}

      {conn.status === "rejected" && (
        <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg">
          <UserX size={13} />
          Rejected
        </span>
      )}
    </div>
  );
}

export default function ConnectionRequestsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  const {
    pending, accepted, rejected,
    isLoading, error, actionLoadingId,
    accept, reject,
  } = useTutorConnections();

  const tabs: { key: TabType; label: string; icon: typeof Clock; count: number }[] = [
    { key: "pending", label: "Pending", icon: Clock, count: pending.length },
    { key: "accepted", label: "Accepted", icon: UserCheck, count: accepted.length },
    { key: "rejected", label: "Rejected", icon: UserX, count: rejected.length },
  ];






  const currentList =
    activeTab === "pending" ? pending :
    activeTab === "accepted" ? accepted :
    rejected;

  return (
    <TutorLayout pendingCount={pending.length}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Connection Requests
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Manage students who want to connect with you.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-morpheus-border pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
                activeTab === tab.key
                  ? "border-morpheus-accent text-morpheus-accent"
                  : "border-transparent text-morpheus-muted hover:text-morpheus-text"
              )}
            >
              <Icon size={15} />
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  activeTab === tab.key
                    ? "bg-morpheus-accent text-white"
                    : "bg-morpheus-surface text-morpheus-muted"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
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
      ) : currentList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <Users size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">
            No {activeTab} requests
          </p>
          <p className="text-morpheus-muted text-sm mt-1">
            {activeTab === "pending"
              ? "When students send you connection requests, they'll appear here."
              : `No ${activeTab} connections yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((conn: any) => (
            <ConnectionCard
              key={conn.id}
              conn={conn}
              onAccept={activeTab === "pending" ? accept : undefined}
              onReject={activeTab === "pending" ? reject : undefined}
              actionLoadingId={actionLoadingId}
            />
          ))}
        </div>
      )}
    </TutorLayout>
  );
}
