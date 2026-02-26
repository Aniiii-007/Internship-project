import { Users, GraduationCap, Loader2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminStudents, useAdminTutors } from "../../hooks/useAdmin";
import { cn } from "../../lib/utils";

export default function AdminStudentsPage() {
  const { students, isLoading, error } = useAdminStudents();
  const { tutors } = useAdminTutors();
  const pending = tutors.filter((t) => t.status === "pending");

  return (
    <AdminLayout pendingCount={pending.length}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Students
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          {students.length > 0
            ? `${students.length} registered student${students.length > 1 ? "s" : ""}`
            : "All registered students on the platform."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-red-400" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <Users size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">No students yet</p>
          <p className="text-morpheus-muted text-sm mt-1">
            Students will appear here once they sign up.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student: any) => {
            const name = student.user?.name ?? student.name ?? "Student";
            const email = student.user?.email ?? student.email ?? "";
            const grade = student.grade ?? student.studentProfile?.grade ?? null;
            const school = student.schoolName ?? student.studentProfile?.schoolName ?? null;
            const subjects = student.subjects ?? student.studentProfile?.subjects ?? [];

            const initials = name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-5 transition-all hover:border-red-500/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-blue-400">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-morpheus-text truncate">{name}</p>
                    <p className="text-xs text-morpheus-muted truncate">{email}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-morpheus-muted">
                  {grade && (
                    <div className="flex items-center gap-2">
                      <GraduationCap size={13} />
                      <span>{grade}</span>
                    </div>
                  )}
                  {school && (
                    <div className="flex items-center gap-2">
                      <span>🏫</span>
                      <span className="truncate">{school}</span>
                    </div>
                  )}
                </div>

                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {subjects.slice(0, 3).map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-md border border-morpheus-border text-morpheus-muted"
                      >
                        {s.subject?.name ?? s.name}
                      </span>
                    ))}
                    {subjects.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-md border border-morpheus-border text-morpheus-muted">
                        +{subjects.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs text-morpheus-muted mt-3">
                  Joined {new Date(student.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
