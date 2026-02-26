/*import { Users, GraduationCap, Clock, CheckCircle, Video, Star } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminStats, useAdminTutors } from "../../hooks/useAdmin";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Users; label: string; value: string | number; color: string;
}) {
  return (
    <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-5">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color)}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-semibold font-display text-morpheus-text">{value}</p>
      <p className="text-sm text-morpheus-muted mt-0.5">{label}</p>
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  suspended: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { tutors, approve, reject, actionLoadingId } = useAdminTutors();

  const pending = tutors.filter((t) => t.status === "pending");
  const approved = tutors.filter((t) => t.status === "approved");

  return (
    <AdminLayout pendingCount={pending.length}>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Admin Dashboard
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Platform overview and tutor management.
        </p>
      </div>

      {/* Stats */
      /*<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={GraduationCap}
          label="Total tutors"
          value={statsLoading ? "—" : (stats?.totalTutors ?? tutors.length)}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          icon={Clock}
          label="Pending approval"
          value={pending.length}
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Approved tutors"
          value={approved.length}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          icon={Users}
          label="Total students"
          value={statsLoading ? "—" : (stats?.totalStudents ?? "—")}
          color="bg-blue-500/10 text-blue-400"
        />
      </div>

      {/* Pending tutors */
      /*{pending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-morpheus-text">
                Awaiting approval
              </h2>
              <p className="text-xs text-morpheus-muted mt-0.5">
                Review and approve tutor profiles
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/tutors")}
              className="text-sm text-red-400 hover:underline font-medium"
            >
              View all →
            </button>
          </div>

          <div className="space-y-3">
            {pending.slice(0, 5).map((tutor: any) => {
              const name = tutor.user?.name ?? tutor.name ?? "Tutor";
              const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              const isLoading = actionLoadingId === tutor.id;

              return (
                <div key={tutor.id} className="flex items-center gap-4 rounded-2xl border border-morpheus-border bg-morpheus-surface px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-amber-400">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-morpheus-text">{name}</p>
                    <p className="text-xs text-morpheus-muted truncate">
                      {tutor.education} · {tutor.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => reject(tutor.id)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approve(tutor.id)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No pending */
     /* {pending.length === 0 && (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-10 text-center">
          <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">All caught up!</p>
          <p className="text-morpheus-muted text-sm mt-1">No tutors waiting for approval.</p>
        </div>
      )}
    </AdminLayout>
  );
}*/








////The below code is written for solving the issue of tutors not found on admin panel 

import { GraduationCap, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminTutors } from "../../hooks/useAdmin";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof GraduationCap; label: string; value: string | number; color: string;
}) {
  return (
    <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-5">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color)}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-semibold font-display text-morpheus-text">{value}</p>
      <p className="text-sm text-morpheus-muted mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { tutors, isLoading, approve, reject, actionLoadingId } = useAdminTutors();

  // Since API only returns pending tutors, all returned tutors are pending
  const pending = tutors;

  return (
    <AdminLayout pendingCount={pending.length}>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Admin Dashboard
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Platform overview and tutor approval management.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Clock}
          label="Pending approval"
          value={isLoading ? "—" : pending.length}
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          icon={GraduationCap}
          label="Tutors in queue"
          value={isLoading ? "—" : pending.length}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Action required"
          value={isLoading ? "—" : pending.length > 0 ? "Yes" : "None"}
          color="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      {/* Pending tutors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-morpheus-text">
              Awaiting approval
            </h2>
            <p className="text-xs text-morpheus-muted mt-0.5">
              Review and approve tutor profiles
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/tutors")}
            className="text-sm text-red-400 hover:underline font-medium"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={24} className="animate-spin text-red-400" />
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-morpheus-border p-10 text-center">
            <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-morpheus-text font-medium">All caught up!</p>
            <p className="text-morpheus-muted text-sm mt-1">
              No tutors waiting for approval.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((tutor: any) => {
              const name = tutor.user?.name ?? tutor.name ?? "Tutor";
              const email = tutor.user?.email ?? tutor.email ?? "";
              const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              const isActionLoading = actionLoadingId === tutor.id;

              return (
                <div key={tutor.id} className="flex items-center gap-4 rounded-2xl border border-morpheus-border bg-morpheus-surface px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-amber-400">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-morpheus-text">{name}</p>
                    <p className="text-xs text-morpheus-muted truncate">
                      {email} · {tutor.education}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => reject(tutor.id)}
                      disabled={isActionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                      Reject
                    </button>
                    <button
                      onClick={() => approve(tutor.id)}
                      disabled={isActionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                    >
                      {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

