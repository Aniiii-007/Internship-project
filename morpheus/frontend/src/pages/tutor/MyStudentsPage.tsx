import { useNavigate } from "react-router-dom";
import { Users, MessageSquare, Video, Loader2, GraduationCap } from "lucide-react";
import TutorLayout from "../../components/shared/TutorLayout";
import { useTutorConnections } from "../../hooks/useTutor";
import { cn } from "../../lib/utils";

export default function MyStudentsPage() {
  const navigate = useNavigate();
  const { accepted, pending, isLoading, error } = useTutorConnections();

  return (
    <TutorLayout pendingCount={pending.length}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          My Students
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          {accepted.length > 0
            ? `${accepted.length} connected student${accepted.length > 1 ? "s" : ""}`
            : "Students you've connected with will appear here."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-morpheus-accent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : accepted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <Users size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">No students yet</p>
          <p className="text-morpheus-muted text-sm mt-1">
            Accept connection requests to start working with students.
          </p>
          {pending.length > 0 && (
            <button
              onClick={() => navigate("/tutor/requests")}
              className="mt-4 text-sm text-morpheus-accent hover:underline"
            >
              View {pending.length} pending request{pending.length > 1 ? "s" : ""} →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accepted.map((conn: any) => {
            const studentName = conn.student?.user?.name ?? conn.studentName ?? "Student";
            const studentEmail = conn.student?.user?.email ?? conn.studentEmail ?? "";
            const grade = conn.student?.studentProfile?.grade ?? null;
            const school = conn.student?.studentProfile?.schoolName ?? null;
            const subjects = conn.student?.studentProfile?.subjects ?? [];

            const initials = studentName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={conn.id}
                className={cn(
                  "rounded-2xl border border-morpheus-border bg-morpheus-surface p-5",
                  "transition-all hover:border-morpheus-accent/30 hover:shadow-lg hover:shadow-morpheus-accent/5"
                )}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-emerald-400">{initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-morpheus-text truncate">{studentName}</p>
                    <p className="text-xs text-morpheus-muted truncate">{studentEmail}</p>
                  </div>
                </div>

                {/* Details */}
                {(grade || school) && (
                  <div className="space-y-1.5 mb-4">
                    {grade && (
                      <div className="flex items-center gap-2 text-xs text-morpheus-muted">
                        <GraduationCap size={13} />
                        <span>{grade}</span>
                      </div>
                    )}
                    {school && (
                      <div className="flex items-center gap-2 text-xs text-morpheus-muted">
                        <span className="w-3.5 h-3.5 flex items-center justify-center">🏫</span>
                        <span className="truncate">{school}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Subjects */}
                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {subjects.slice(0, 3).map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-md border border-morpheus-border text-morpheus-muted"
                      >
                        {s.subject?.name ?? s.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Connected since */}
                <p className="text-xs text-morpheus-muted mb-4">
                  Connected {new Date(conn.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/tutor/chat")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-morpheus-border text-xs text-morpheus-muted hover:text-morpheus-accent hover:border-morpheus-accent/40 transition-all"
                  >
                    <MessageSquare size={13} />
                    Message
                  </button>
                  <button
                    onClick={() => navigate("/tutor/sessions")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-morpheus-border text-xs text-morpheus-muted hover:text-morpheus-accent hover:border-morpheus-accent/40 transition-all"
                  >
                    <Video size={13} />
                    Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </TutorLayout>
  );
}
