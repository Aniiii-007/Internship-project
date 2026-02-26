/*import { useState } from "react";
import { CheckCircle, XCircle, ShieldOff, Loader2, Eye, GraduationCap, MapPin, Star } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminTutors } from "../../hooks/useAdmin";
import { cn } from "../../lib/utils";

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "suspended";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  approved: { label: "Approved", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  rejected: { label: "Rejected", className: "text-red-400 bg-red-400/10 border-red-400/20" },
  suspended: { label: "Suspended", className: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
};

const tabs: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "suspended", label: "Suspended" },
];

export default function TutorManagementPage() {
  const [activeTab, setActiveTab] = useState<StatusFilter>("pending");
  const [selectedTutor, setSelectedTutor] = useState<any>(null);

  const { tutors, isLoading, error, actionLoadingId, approve, reject, suspend } = useAdminTutors();

  const pending = tutors.filter((t) => t.status === "pending");

  const filtered = activeTab === "all"
    ? tutors
    : tutors.filter((t) => t.status === activeTab);

  return (
    <AdminLayout pendingCount={pending.length}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Tutor Management
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Review, approve and manage tutor profiles.
        </p>
      </div>

      {/* Tabs */
     /* <div className="flex gap-1 mb-6 border-b border-morpheus-border">
        {tabs.map((tab) => {
          const count = tab.key === "all"
            ? tutors.length
            : tutors.filter((t) => t.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
                activeTab === tab.key
                  ? "border-red-400 text-red-400"
                  : "border-transparent text-morpheus-muted hover:text-morpheus-text"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  activeTab === tab.key ? "bg-red-500 text-white" : "bg-morpheus-surface text-morpheus-muted"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-red-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <GraduationCap size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">No {activeTab} tutors</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tutor: any) => {
            const name = tutor.user?.name ?? tutor.name ?? "Tutor";
            const email = tutor.user?.email ?? tutor.email ?? "";
            const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            const isLoading = actionLoadingId === tutor.id;
            const status = statusConfig[tutor.status] ?? statusConfig.pending;

            return (
              <div key={tutor.id} className="rounded-2xl border border-morpheus-border bg-morpheus-surface overflow-hidden">
                {/* Main row */
             /*   <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */
                 /* <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm",
                    tutor.status === "approved" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
                    tutor.status === "rejected" ? "bg-red-500/10 border border-red-500/20 text-red-400" :
                    tutor.status === "suspended" ? "bg-orange-500/10 border border-orange-500/20 text-orange-400" :
                    "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  )}>
                    {initials}
                  </div>

                  {/* Info */
              /*    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-morpheus-text">{name}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", status.className)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-morpheus-muted truncate">{email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-morpheus-muted">
                      {tutor.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />{tutor.city}
                        </span>
                      )}
                      {tutor.experienceYears > 0 && (
                        <span>{tutor.experienceYears}y exp</span>
                      )}
                      {tutor.averageRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={11} className="text-amber-400" />
                          {(tutor.averageRating / 10).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */
                /*  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedTutor(selectedTutor?.id === tutor.id ? null : tutor)}
                      className="w-8 h-8 rounded-lg border border-morpheus-border text-morpheus-muted hover:text-morpheus-text hover:border-morpheus-accent/40 flex items-center justify-center transition-all"
                    >
                      <Eye size={14} />
                    </button>

                    {tutor.status === "pending" && (
                      <>
                        <button
                          onClick={() => reject(tutor.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                          Reject
                        </button>
                        <button
                          onClick={() => approve(tutor.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                          Approve
                        </button>
                      </>
                    )}

                    {tutor.status === "approved" && (
                      <button
                        onClick={() => suspend(tutor.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/10 transition-all disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={13} />}
                        Suspend
                      </button>
                    )}

                    {(tutor.status === "rejected" || tutor.status === "suspended") && (
                      <button
                        onClick={() => approve(tutor.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                        Re-approve
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail panel */
            /*    {selectedTutor?.id === tutor.id && (
                  <div className="border-t border-morpheus-border px-5 py-4 bg-morpheus-bg/50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Education</p>
                        <p className="text-morpheus-text">{tutor.education || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">College</p>
                        <p className="text-morpheus-text">{tutor.collegeName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Degree</p>
                        <p className="text-morpheus-text">{tutor.degreeName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Marks/CGPA</p>
                        <p className="text-morpheus-text">{tutor.marks || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Date of Birth</p>
                        <p className="text-morpheus-text">{tutor.dob || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Experience</p>
                        <p className="text-morpheus-text">{tutor.experienceYears ?? 0} years</p>
                      </div>
                    </div>

                    {/* Subjects */
                /*    {tutor.subjects?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-morpheus-muted mb-2">Subjects</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tutor.subjects.map((s: any, idx: number) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded-lg border border-morpheus-border text-morpheus-muted">
                              {s.subject?.name ?? s.name} · <span className="capitalize">{s.level}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files */
           /*         <div className="flex gap-3 mt-4">
                      {tutor.introVideoUrl && (
                        <a href={tutor.introVideoUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-morpheus-accent hover:underline flex items-center gap-1">
                          View intro video →
                        </a>
                      )}
                      {tutor.collegeIdUrl && (
                        <a href={tutor.collegeIdUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-morpheus-accent hover:underline flex items-center gap-1">
                          View college ID →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}*/





///The below code is written for fixing the issue of tutors not found on admin panel

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Eye, MapPin, GraduationCap } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminTutors } from "../../hooks/useAdmin";
import { cn } from "../../lib/utils";

export default function TutorManagementPage() {
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const { tutors, isLoading, error, actionLoadingId, approve, reject } = useAdminTutors();

  // API only returns pending tutors
  const pending = tutors;

  return (
    <AdminLayout pendingCount={pending.length}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Tutor Management
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Review and approve pending tutor profiles.
        </p>
      </div>

      {/* Count badge */}
      {pending.length > 0 && (
        <div className="mb-5 flex items-center gap-2">
          <span className="text-sm text-morpheus-muted">
            {pending.length} tutor{pending.length > 1 ? "s" : ""} waiting for review
          </span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-red-400" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <GraduationCap size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">No pending tutors</p>
          <p className="text-morpheus-muted text-sm mt-1">
            All tutor applications have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((tutor: any) => {
            const name = tutor.user?.name ?? tutor.name ?? "Tutor";
            const email = tutor.user?.email ?? tutor.email ?? "";
            const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            const isActionLoading = actionLoadingId === tutor.id;

            return (
              <div key={tutor.id} className="rounded-2xl border border-morpheus-border bg-morpheus-surface overflow-hidden">
                {/* Main row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 font-semibold text-sm text-amber-400">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-morpheus-text">{name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full border font-medium text-amber-400 bg-amber-400/10 border-amber-400/20">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-morpheus-muted truncate">{email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-morpheus-muted">
                      {tutor.education && <span>{tutor.education}</span>}
                      {tutor.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />{tutor.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedTutor(selectedTutor?.id === tutor.id ? null : tutor)}
                      className="w-8 h-8 rounded-lg border border-morpheus-border text-morpheus-muted hover:text-morpheus-text flex items-center justify-center transition-all"
                    >
                      <Eye size={14} />
                    </button>
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

                {/* Expanded detail panel */}
                {selectedTutor?.id === tutor.id && (
                  <div className="border-t border-morpheus-border px-5 py-4 bg-morpheus-bg/50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Education</p>
                        <p className="text-morpheus-text">{tutor.education || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">College</p>
                        <p className="text-morpheus-text">{tutor.collegeName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Degree</p>
                        <p className="text-morpheus-text">{tutor.degreeName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Marks/CGPA</p>
                        <p className="text-morpheus-text">{tutor.marks || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">City</p>
                        <p className="text-morpheus-text">{tutor.city || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-morpheus-muted mb-1">Experience</p>
                        <p className="text-morpheus-text">{tutor.experienceYears ?? 0} years</p>
                      </div>
                    </div>

                    {tutor.subjects?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-morpheus-muted mb-2">Subjects</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tutor.subjects.map((s: any, idx: number) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded-lg border border-morpheus-border text-morpheus-muted">
                              {s.subject?.name ?? s.name} · <span className="capitalize">{s.level}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 mt-4">
                      {tutor.introVideoUrl && (
                        <a href={tutor.introVideoUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-morpheus-accent hover:underline">
                          View intro video →
                        </a>
                      )}
                      {tutor.collegeIdUrl && (
                        <a href={tutor.collegeIdUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-morpheus-accent hover:underline">
                          View college ID →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

