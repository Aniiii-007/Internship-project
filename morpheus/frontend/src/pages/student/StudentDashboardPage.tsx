import { BookOpen, Users, Video, TrendingUp } from "lucide-react";
import StudentLayout from "../../components/shared/StudentLayout";
import TutorCard from "../../components/tutor/TutorCard";
import { useRecommendations, useConnections } from "../../hooks/useStudent";
import { useAuthStore } from "../../store/auth.store";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  color: string;
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

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { tutors, isLoading } = useRecommendations();
  const { connections, sendRequest, sendingId, getConnectionStatus } = useConnections();

  const acceptedConnections = connections.filter((c) => c.status === "accepted").length;
  const pendingConnections = connections.filter((c) => c.status === "pending").length;

  const firstName = user?.name?.split(" ")[0];

  return (
    <StudentLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Here's what's happening with your learning journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Connections"
          value={String(acceptedConnections)}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Pending requests"
          value={String(pendingConnections)}
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          icon={Video}
          label="Sessions"
          value="0"
          color="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          icon={BookOpen}
          label="Subjects"
          value="—"
          color="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-morpheus-text">
              Recommended tutors
            </h2>
            <p className="text-xs text-morpheus-muted mt-0.5">
              Matched to your subjects and level
            </p>
          </div>
          <button
            onClick={() => navigate("/student/discovery")}
            className="text-sm text-morpheus-accent hover:underline font-medium"
          >
            Browse all →
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-morpheus-border bg-morpheus-surface animate-pulse"
              />
            ))}
          </div>
        ) : tutors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-morpheus-border p-10 text-center">
            <p className="text-morpheus-muted text-sm">
              No recommendations yet. Complete your profile with subjects to get matched.
            </p>
            <button
              onClick={() => navigate("/student/discovery")}
              className="mt-3 text-sm text-morpheus-accent hover:underline"
            >
              Browse all tutors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutors.slice(0, 6).map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                connectionStatus={getConnectionStatus(tutor.id)}
                isSending={sendingId === tutor.id}
                onConnect={sendRequest}
              />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
