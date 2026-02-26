/*import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Briefcase, GraduationCap,
  Video, Loader2, UserCheck, Clock, MessageSquare,
} from "lucide-react";
import StudentLayout from "../../components/shared/StudentLayout";
import StarRating from "../../components/shared/StarRating";
import { useTutorProfile, useConnections } from "../../hooks/useStudent";
import { cn } from "../../lib/utils";

const levelColors = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-6">
      <h3 className="font-display text-sm font-semibold text-morpheus-text mb-4 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function TutorProfilePage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { tutor, isLoading, error } = useTutorProfile(tutorId!);
  const { sendRequest, sendingId, getConnectionStatus } = useConnections();

  const connectionStatus = tutor ? getConnectionStatus(tutor.id) : null;

  const initials = tutor?.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-morpheus-accent" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !tutor) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <p className="text-morpheus-muted">Tutor not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-morpheus-accent hover:underline text-sm"
          >
            Go back
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Back */
  /*    <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-morpheus-muted hover:text-morpheus-text mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */
    /*    <div className="lg:col-span-1 space-y-4">
          {/* Profile card */
   /*       <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-6 text-center">
            {/* Avatar */
   /*         <div className="w-20 h-20 rounded-2xl bg-morpheus-accent/15 border border-morpheus-accent/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-morpheus-accent font-display">
                {initials}
              </span>
            </div>

            <h1 className="font-display text-xl font-semibold text-morpheus-text">
              {tutor.user.name}
            </h1>
            <p className="text-morpheus-muted text-sm mt-1">
              {tutor.degreeName || tutor.education}
            </p>

            {/* Meta */
   /*         <div className="flex items-center justify-center gap-4 mt-3 text-xs text-morpheus-muted">
              {tutor.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {tutor.city}
                </span>
              )}
              {tutor.experienceYears > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  {tutor.experienceYears}y exp
                </span>
              )}
            </div>

            {/* Rating */
        /*    <div className="flex items-center justify-center gap-2 mt-3">
              <StarRating
                rating={
                  tutor.averageRating > 0 ? tutor.averageRating / 10 : 0
                }
                showValue={tutor.totalReviews > 0}
              />
              {tutor.totalReviews > 0 && (
                <span className="text-xs text-morpheus-muted">
                  ({tutor.totalReviews} reviews)
                </span>
              )}
            </div>

            {/* Connect button */
   /*         <div className="mt-5 space-y-2">
              {connectionStatus === "accepted" ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                  <UserCheck size={15} />
                  Connected
                </div>
              ) : connectionStatus === "pending" ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20">
                  <Clock size={15} />
                  Request Pending
                </div>
              ) : (
                <button
                  onClick={() => sendRequest(tutor.id)}
                  disabled={sendingId === tutor.id}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl",
                    "bg-morpheus-accent text-white text-sm font-medium",
                    "hover:bg-morpheus-accent/90 transition-all",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {sendingId === tutor.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    "Send Connection Request"
                  )}
                </button>
              )}

              {connectionStatus === "accepted" && (
                <button
                  onClick={() => navigate("/student/chat")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-morpheus-border text-sm text-morpheus-muted hover:text-morpheus-text hover:border-morpheus-accent/40 transition-all"
                >
                  <MessageSquare size={15} />
                  Message
                </button>
              )}
            </div>
          </div>

          {/* Education */
      /*    <Section title="Education">
            <div className="space-y-2 text-sm">
              {tutor.collegeName && (
                <div className="flex items-start gap-2">
                  <GraduationCap size={15} className="text-morpheus-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-morpheus-text font-medium">{tutor.collegeName}</p>
                    {tutor.degreeName && (
                      <p className="text-morpheus-muted text-xs">{tutor.degreeName}</p>
                    )}
                    {tutor.marks && (
                      <p className="text-morpheus-muted text-xs">CGPA/Score: {tutor.marks}</p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-morpheus-muted text-xs leading-relaxed">
                {tutor.education}
              </p>
            </div>
          </Section>
        </div>

        {/* Right column */
 /*       <div className="lg:col-span-2 space-y-4">
          {/* Intro video */
    /*      {tutor.introVideoUrl && (
            <Section title="Intro Video">
              <video
                src={tutor.introVideoUrl}
                controls
                className="w-full rounded-xl bg-black aspect-video"
              />
            </Section>
          )}

          {/* Subjects */
  /*        {tutor.subjects?.length > 0 && (
            <Section title="Subjects I Teach">
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((s) => (
                  <span
                    key={s.subjectId}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-sm font-medium flex items-center gap-2",
                      levelColors[s.level]
                    )}
                  >
                    {s.subject.name}
                    <span className="text-xs opacity-70 capitalize">{s.level}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Reviews */
  /*        <Section title={`Reviews (${tutor.reviews?.length ?? 0})`}>
            {!tutor.reviews || tutor.reviews.length === 0 ? (
              <p className="text-morpheus-muted text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {tutor.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-morpheus-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-full bg-morpheus-surface border border-morpheus-border flex items-center justify-center">
                        <span className="text-xs font-medium text-morpheus-muted">
                          {review.student?.user?.name?.[0] ?? "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-morpheus-text">
                          {review.student?.user?.name ?? "Student"}
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size={12} />
                          <span className="text-xs text-morpheus-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-morpheus-muted leading-relaxed pl-10">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </StudentLayout>
  );
/*}*///The abpove code is before fixing the issue issue of profile card of a tutor





/**The below code is after fixing the error of profile card of a tutor */

/*import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Briefcase, GraduationCap,
  Loader2, UserCheck, Clock, MessageSquare,
} from "lucide-react";
import StudentLayout from "../../components/shared/StudentLayout";
import StarRating from "../../components/shared/StarRating";
import { useTutorProfile, useConnections } from "../../hooks/useStudent";
import { useStartConversation } from "../../hooks/useChat";
import { cn } from "../../lib/utils";

const levelColors: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-6">
      <h3 className="font-display text-sm font-semibold text-morpheus-text mb-4 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function TutorProfilePage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { tutor, isLoading, error } = useTutorProfile(tutorId!);
  const { sendRequest, sendingId, getConnectionStatus } = useConnections();

  const connectionStatus = tutor ? getConnectionStatus(tutor.id) : null;

  // Backend returns name directly on tutor object (not nested in user)
  const name = (tutor as any)?.name ?? tutor?.user?.name ?? "Tutor";

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Backend returns recentReviews not reviews
  const reviews = (tutor as any)?.recentReviews ?? tutor?.reviews ?? [];

  // Backend returns subjects as [{ name, level }] directly
  const subjects = (tutor as any)?.subjects ?? [];

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-morpheus-accent" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !tutor) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <p className="text-morpheus-muted">Tutor not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-morpheus-accent hover:underline text-sm"
          >
            Go back
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Back */
     /* <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-morpheus-muted hover:text-morpheus-text mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */
      /*  <div className="lg:col-span-1 space-y-4">
       /*   {/* Profile card */
       /*   <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-morpheus-accent/15 border border-morpheus-accent/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-morpheus-accent font-display">
                {initials}
              </span>
            </div>

            <h1 className="font-display text-xl font-semibold text-morpheus-text">
              {name}
            </h1>
            <p className="text-morpheus-muted text-sm mt-1">
              {tutor.degreeName || tutor.education}
            </p>

            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-morpheus-muted">
              {tutor.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {tutor.city}
                </span>
              )}
              {tutor.experienceYears > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  {tutor.experienceYears}y exp
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              <StarRating
                rating={tutor.averageRating > 0 ? tutor.averageRating / 10 : 0}
                showValue={tutor.totalReviews > 0}
              />
              {tutor.totalReviews > 0 && (
                <span className="text-xs text-morpheus-muted">
                  ({tutor.totalReviews} reviews)
                </span>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {connectionStatus === "accepted" ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                  <UserCheck size={15} />
                  Connected
                </div>
              ) : connectionStatus === "pending" ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20">
                  <Clock size={15} />
                  Request Pending
                </div>
              ) : (
                <button
                  onClick={() => sendRequest(tutor.id)}
                  disabled={sendingId === tutor.id}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl",
                    "bg-morpheus-accent text-white text-sm font-medium",
                    "hover:bg-morpheus-accent/90 transition-all",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {sendingId === tutor.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    "Send Connection Request"
                  )}
                </button>
              )}

              {connectionStatus === "accepted" && (
                <button
                  onClick={() => navigate("/student/chat")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-morpheus-border text-sm text-morpheus-muted hover:text-morpheus-text hover:border-morpheus-accent/40 transition-all"
                >
                  <MessageSquare size={15} />
                  Message
                </button>
              )}
            </div>
          </div>

          {/* Education */
         /* <Section title="Education">
            <div className="space-y-2 text-sm">
              {tutor.collegeName && (
                <div className="flex items-start gap-2">
                  <GraduationCap size={15} className="text-morpheus-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-morpheus-text font-medium">{tutor.collegeName}</p>
                    {tutor.degreeName && (
                      <p className="text-morpheus-muted text-xs">{tutor.degreeName}</p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-morpheus-muted text-xs leading-relaxed">
                {tutor.education}
              </p>
            </div>
          </Section>
        </div>

        {/* Right column */
    /*    <div className="lg:col-span-2 space-y-4">
          {tutor.introVideoUrl && (
            <Section title="Intro Video">
              <video
                src={tutor.introVideoUrl}
                controls
                className="w-full rounded-xl bg-black aspect-video"
              />
            </Section>
          )}

          {subjects.length > 0 && (
            <Section title="Subjects I Teach">
              <div className="flex flex-wrap gap-2">
                {subjects.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-sm font-medium flex items-center gap-2",
                      levelColors[s.level] ?? "text-morpheus-muted border-morpheus-border"
                    )}
                  >
                    {s.name}
                    <span className="text-xs opacity-70 capitalize">{s.level}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title={`Reviews (${reviews.length})`}>
            {reviews.length === 0 ? (
              <p className="text-morpheus-muted text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="border-b border-morpheus-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-full bg-morpheus-surface border border-morpheus-border flex items-center justify-center">
                        <span className="text-xs font-medium text-morpheus-muted">
                          {review.student?.user?.name?.[0] ?? "S"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-morpheus-text">
                          {review.student?.user?.name ?? "Student"}
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size={12} />
                          <span className="text-xs text-morpheus-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-morpheus-muted leading-relaxed pl-10">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </StudentLayout>
  );
}*/












import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Briefcase, GraduationCap,
  Loader2, UserCheck, Clock, MessageSquare,
} from "lucide-react";
import StudentLayout from "../../components/shared/StudentLayout";
import StarRating from "../../components/shared/StarRating";
import { useTutorProfile, useConnections } from "../../hooks/useStudent";
import { useStartConversation } from "../../hooks/useChat";
import { cn } from "../../lib/utils";

const levelColors: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-6">
      <h3 className="font-display text-sm font-semibold text-morpheus-text mb-4 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function TutorProfilePage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { tutor, isLoading, error } = useTutorProfile(tutorId!);
  const { sendRequest, sendingId, getConnectionStatus } = useConnections();
  const { start, isLoading: startingChat } = useStartConversation();

  const connectionStatus = tutor ? getConnectionStatus(tutor.id) : null;

  const name = (tutor as any)?.name ?? tutor?.user?.name ?? "Tutor";

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const reviews = (tutor as any)?.recentReviews ?? tutor?.reviews ?? [];
  const subjects = (tutor as any)?.subjects ?? [];

  const handleMessage = async () => {
    if (!tutor) return;
    const conversationId = await start(tutor.id);
    if (conversationId) {
      navigate(`/student/chat?conversationId=${conversationId}`);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-morpheus-accent" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !tutor) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <p className="text-morpheus-muted">Tutor not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-morpheus-accent hover:underline text-sm"
          >
            Go back
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-morpheus-muted hover:text-morpheus-text mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile card */}
          <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-morpheus-accent/15 border border-morpheus-accent/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-morpheus-accent font-display">
                {initials}
              </span>
            </div>

            <h1 className="font-display text-xl font-semibold text-morpheus-text">
              {name}
            </h1>
            <p className="text-morpheus-muted text-sm mt-1">
              {tutor.degreeName || tutor.education}
            </p>

            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-morpheus-muted">
              {tutor.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {tutor.city}
                </span>
              )}
              {tutor.experienceYears > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  {tutor.experienceYears}y exp
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              <StarRating
                rating={tutor.averageRating > 0 ? tutor.averageRating / 10 : 0}
                showValue={tutor.totalReviews > 0}
              />
              {tutor.totalReviews > 0 && (
                <span className="text-xs text-morpheus-muted">
                  ({tutor.totalReviews} reviews)
                </span>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {connectionStatus === "accepted" ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                  <UserCheck size={15} />
                  Connected
                </div>
              ) : connectionStatus === "pending" ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20">
                  <Clock size={15} />
                  Request Pending
                </div>
              ) : (
                <button
                  onClick={() => sendRequest(tutor.id)}
                  disabled={sendingId === tutor.id}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl",
                    "bg-morpheus-accent text-white text-sm font-medium",
                    "hover:bg-morpheus-accent/90 transition-all",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {sendingId === tutor.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    "Send Connection Request"
                  )}
                </button>
              )}

              {connectionStatus === "accepted" && (
                <button
                  onClick={handleMessage}
                  disabled={startingChat}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-morpheus-border text-sm text-morpheus-muted hover:text-morpheus-text hover:border-morpheus-accent/40 transition-all disabled:opacity-50"
                >
                  {startingChat ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <MessageSquare size={15} />
                  )}
                  {startingChat ? "Opening..." : "Message"}
                </button>
              )}
            </div>
          </div>

          {/* Education */}
          <Section title="Education">
            <div className="space-y-2 text-sm">
              {tutor.collegeName && (
                <div className="flex items-start gap-2">
                  <GraduationCap size={15} className="text-morpheus-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-morpheus-text font-medium">{tutor.collegeName}</p>
                    {tutor.degreeName && (
                      <p className="text-morpheus-muted text-xs">{tutor.degreeName}</p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-morpheus-muted text-xs leading-relaxed">
                {tutor.education}
              </p>
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {tutor.introVideoUrl && (
            <Section title="Intro Video">
              <video
                src={tutor.introVideoUrl}
                controls
                className="w-full rounded-xl bg-black aspect-video"
              />
            </Section>
          )}

          {subjects.length > 0 && (
            <Section title="Subjects I Teach">
              <div className="flex flex-wrap gap-2">
                {subjects.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-sm font-medium flex items-center gap-2",
                      levelColors[s.level] ?? "text-morpheus-muted border-morpheus-border"
                    )}
                  >
                    {s.name}
                    <span className="text-xs opacity-70 capitalize">{s.level}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title={`Reviews (${reviews.length})`}>
            {reviews.length === 0 ? (
              <p className="text-morpheus-muted text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="border-b border-morpheus-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-full bg-morpheus-surface border border-morpheus-border flex items-center justify-center">
                        <span className="text-xs font-medium text-morpheus-muted">
                          {review.student?.user?.name?.[0] ?? "S"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-morpheus-text">
                          {review.student?.user?.name ?? "Student"}
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size={12} />
                          <span className="text-xs text-morpheus-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-morpheus-muted leading-relaxed pl-10">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </StudentLayout>
  );
}
