import { useNavigate } from "react-router-dom";
import { Users, Clock, Star, CheckCircle, AlertCircle, Video, ArrowRight } from "lucide-react";
import TutorLayout from "../../components/shared/TutorLayout";
import { useTutorOwnProfile, useTutorConnections } from "../../hooks/useTutor";
import { useAuthStore } from "../../store/auth.store";
import { cn } from "../../lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  colorClass: string;
}) {
  return (
    <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-5">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", colorClass)}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-semibold font-display text-morpheus-text">{value}</p>
      <p className="text-sm text-morpheus-muted mt-0.5">{label}</p>
    </div>
  );
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Under Review",
    description: "Your profile is being reviewed by our admin team. This usually takes 24–48 hours.",
    className: "border-amber-500/20 bg-amber-500/5",
    iconClass: "text-amber-400",
    textClass: "text-amber-400",
  },
  approved: {
    icon: CheckCircle,
    label: "Profile Approved",
    description: "Your profile is live and visible to students. Keep it updated to attract more students.",
    className: "border-emerald-500/20 bg-emerald-500/5",
    iconClass: "text-emerald-400",
    textClass: "text-emerald-400",
  },
  rejected: {
    icon: AlertCircle,
    label: "Profile Rejected",
    description: "Your profile was not approved. Please contact support for more information.",
    className: "border-red-500/20 bg-red-500/5",
    iconClass: "text-red-400",
    textClass: "text-red-400",
  },
  suspended: {
    icon: AlertCircle,
    label: "Account Suspended",
    description: "Your account has been suspended. Please contact support.",
    className: "border-red-500/20 bg-red-500/5",
    iconClass: "text-red-400",
    textClass: "text-red-400",
  },
};

export default function TutorDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useTutorOwnProfile();
  const { pending, accepted, isLoading: connectionsLoading } = useTutorConnections();

  const firstName = user?.name?.split(" ")[0];
  const status = profile?.status ?? "pending";
  const statusInfo = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <TutorLayout pendingCount={pending.length}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Here's an overview of your tutoring activity.
        </p>
      </div>

      {/* Profile status banner */}
      <div className={cn(
        "rounded-2xl border p-5 mb-8 flex items-start gap-4",
        statusInfo.className
      )}>
        <div className={cn("mt-0.5 shrink-0", statusInfo.iconClass)}>
          <StatusIcon size={20} />
        </div>
        <div className="flex-1">
          <p className={cn("text-sm font-semibold", statusInfo.textClass)}>
            {statusInfo.label}
          </p>
          <p className="text-sm text-morpheus-muted mt-0.5">
            {statusInfo.description}
          </p>
        </div>
        {status === "approved" && (
          <div className="shrink-0">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-400/15 text-emerald-400 font-medium border border-emerald-400/20">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Connected students"
          value={connectionsLoading ? "—" : accepted.length}
          colorClass="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={Clock}
          label="Pending requests"
          value={connectionsLoading ? "—" : pending.length}
          colorClass="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          icon={Video}
          label="Sessions"
          value="0"
          colorClass="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          icon={Star}
          label="Avg. rating"
          value={profile?.averageRating > 0
            ? (profile.averageRating / 10).toFixed(1)
            : "New"}
          colorClass="bg-amber-500/10 text-amber-400"
        />
      </div>

      {/* Pending requests preview */}
      {pending.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-morpheus-text">
                Pending requests
              </h2>
              <p className="text-xs text-morpheus-muted mt-0.5">
                Students waiting for your response
              </p>
            </div>
            <button
              onClick={() => navigate("/tutor/requests")}
              className="flex items-center gap-1.5 text-sm text-morpheus-accent hover:underline font-medium"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {pending.slice(0, 3).map((conn: any) => {
              const studentName = conn.student?.user?.name ?? conn.studentName ?? "Student";
              const initials = studentName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

              return (
                <div
                  key={conn.id}
                  className="flex items-center gap-4 rounded-2xl border border-morpheus-border bg-morpheus-surface px-5 py-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-morpheus-accent/10 border border-morpheus-accent/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-morpheus-accent">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-morpheus-text">{studentName}</p>
                    <p className="text-xs text-morpheus-muted">
                      {new Date(conn.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/tutor/requests")}
                    className="text-xs text-morpheus-accent hover:underline font-medium"
                  >
                    Respond →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My students preview */}
      {accepted.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-morpheus-text">
                My students
              </h2>
              <p className="text-xs text-morpheus-muted mt-0.5">
                Your connected students
              </p>
            </div>
            <button
              onClick={() => navigate("/tutor/students")}
              className="flex items-center gap-1.5 text-sm text-morpheus-accent hover:underline font-medium"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accepted.slice(0, 3).map((conn: any) => {
              const studentName = conn.student?.user?.name ?? conn.studentName ?? "Student";
              const initials = studentName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

              return (
                <div
                  key={conn.id}
                  className="flex items-center gap-3 rounded-2xl border border-morpheus-border bg-morpheus-surface px-5 py-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-emerald-400">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-morpheus-text truncate">{studentName}</p>
                    <p className="text-xs text-emerald-400">Connected</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state when no activity */}
      {!connectionsLoading && pending.length === 0 && accepted.length === 0 && (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <Users size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">No connections yet</p>
          <p className="text-morpheus-muted text-sm mt-1">
            {status === "approved"
              ? "Students will start sending you connection requests once they find your profile."
              : "Get approved first — then students will be able to find and connect with you."}
          </p>
        </div>
      )}
    </TutorLayout>
  );
}
