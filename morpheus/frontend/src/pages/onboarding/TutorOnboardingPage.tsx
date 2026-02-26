import { useState, FormEvent, ReactNode } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import OnboardingLayout from "../../components/onboarding/OnboardingLayout";
import SubjectPicker from "../../components/onboarding/SubjectPicker";
import FileUploadField from "../../components/onboarding/FileUploadField";
import { useTutorOnboarding, useSubjects } from "../../hooks/useOnboarding";
import { cn } from "../../lib/utils";
import type { SubjectSelection } from "../../types/onboarding.types";

// ─── Shared field components ──────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-morpheus-text">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputClass = cn(
  "w-full rounded-xl border px-4 py-2.5 text-sm",
  "bg-morpheus-surface text-morpheus-text placeholder:text-morpheus-muted",
  "outline-none transition-all duration-200",
  "border-morpheus-border hover:border-morpheus-accent/40",
  "focus:ring-2 focus:ring-morpheus-accent/20 focus:border-morpheus-accent"
);

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: "Personal" },
  { number: 2, label: "Education" },
  { number: 3, label: "Subjects" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TutorOnboardingPage() {
  const { completeProfile, isLoading, error, uploadProgress, clearError } =
    useTutorOnboarding();
  const { subjects, isLoading: subjectsLoading } = useSubjects();

  const [step, setStep] = useState(1);

  // Step 1 — Personal
  const [personal, setPersonal] = useState({
    dob: "",
    city: "",
  });

  // Step 2 — Education
  const [education, setEducation] = useState({
    education: "",
    collegeName: "",
    degreeName: "",
    marks: "",
    experienceYears: "",
  });
  const [introVideo, setIntroVideo] = useState<File | null>(null);
  const [collegeIdCard, setCollegeIdCard] = useState<File | null>(null);

  // Step 3 — Subjects
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectSelection[]>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Validation per step ───────────────────────────────────────────────────

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!personal.dob) errors.dob = "Date of birth is required.";
    if (!personal.city.trim()) errors.city = "City is required.";
    return errors;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!education.education.trim()) errors.education = "Education background is required.";
    if (!education.collegeName.trim()) errors.collegeName = "College name is required.";
    if (!education.degreeName.trim()) errors.degreeName = "Degree name is required.";
    if (!education.marks.trim()) errors.marks = "Marks / CGPA is required.";
    if (!education.experienceYears || isNaN(Number(education.experienceYears)))
      errors.experienceYears = "Enter valid years of experience.";
    if (!introVideo) errors.introVideo = "Please upload your intro video.";
    if (!collegeIdCard) errors.collegeIdCard = "Please upload your college ID card.";
    return errors;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (selectedSubjects.length === 0)
      errors.subjects = "Add at least one subject you can teach.";
    return errors;
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext = () => {
    let errors: Record<string, string> = {};
    if (step === 1) errors = validateStep1();
    if (step === 2) errors = validateStep2();
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) setStep((s) => s + 1);
  };

  const goBack = () => {
    setFieldErrors({});
    setStep((s) => s - 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const errors = validateStep3();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await completeProfile({
      education: education.education,
      collegeName: education.collegeName,
      degreeName: education.degreeName,
      marks: education.marks,
      dob: personal.dob,
      city: personal.city,
      experienceYears: Number(education.experienceYears),
      introVideo: introVideo!,
      collegeIdCard: collegeIdCard!,
      subjects: selectedSubjects,
    });
  };

  return (
    <OnboardingLayout
      title={
        step === 1
          ? "Tell us about yourself"
          : step === 2
          ? "Your education & experience"
          : "What can you teach?"
      }
      subtitle={
        step === 1
          ? "Basic personal details to get started."
          : step === 2
          ? "Upload your credentials for verification by our admin team."
          : "Add subjects and your proficiency level for each."
      }
      steps={STEPS}
      currentStep={step}
      role="tutor"
    >
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface/50 p-6 space-y-6">

          {/* ── Step 1: Personal ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Date of birth" error={fieldErrors.dob}>
                  <input
                    type="date"
                    value={personal.dob}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, dob: e.target.value }))
                    }
                    max={new Date().toISOString().split("T")[0]}
                    className={inputClass}
                  />
                </Field>

                <Field label="City" error={fieldErrors.city}>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={personal.city}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, city: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Info banner */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                <p className="text-sm text-blue-400">
                  Your profile will be reviewed by our admin team before you can start accepting students. This usually takes 24–48 hours.
                </p>
              </div>
            </>
          )}

          {/* ── Step 2: Education ────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <Field label="Education background" error={fieldErrors.education}>
                <textarea
                  placeholder="e.g. B.Tech in Computer Science from IIT Delhi..."
                  value={education.education}
                  onChange={(e) =>
                    setEducation((ed) => ({ ...ed, education: e.target.value }))
                  }
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="College / University name" error={fieldErrors.collegeName}>
                  <input
                    type="text"
                    placeholder="e.g. IIT Bombay"
                    value={education.collegeName}
                    onChange={(e) =>
                      setEducation((ed) => ({ ...ed, collegeName: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Degree name" error={fieldErrors.degreeName}>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech, M.Sc, MBA"
                    value={education.degreeName}
                    onChange={(e) =>
                      setEducation((ed) => ({ ...ed, degreeName: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Marks / CGPA" error={fieldErrors.marks}>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 CGPA or 85%"
                    value={education.marks}
                    onChange={(e) =>
                      setEducation((ed) => ({ ...ed, marks: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Years of teaching experience" error={fieldErrors.experienceYears}>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g. 2"
                    value={education.experienceYears}
                    onChange={(e) =>
                      setEducation((ed) => ({ ...ed, experienceYears: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="border-t border-morpheus-border pt-2" />

              {/* File uploads */}
              <FileUploadField
                label="Intro video"
                accept="video/*"
                type="video"
                value={introVideo}
                onChange={setIntroVideo}
                hint="Max 50MB · MP4, MOV, AVI. A short 1–2 min intro about yourself."
              />
              {fieldErrors.introVideo && (
                <p className="text-xs text-red-400 -mt-4">{fieldErrors.introVideo}</p>
              )}

              <FileUploadField
                label="College ID card"
                accept="image/*"
                type="image"
                value={collegeIdCard}
                onChange={setCollegeIdCard}
                hint="JPG, PNG · Clear photo of your student/faculty ID card."
              />
              {fieldErrors.collegeIdCard && (
                <p className="text-xs text-red-400 -mt-4">{fieldErrors.collegeIdCard}</p>
              )}
            </>
          )}

          {/* ── Step 3: Subjects ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-morpheus-text">
                  Subjects you can teach
                </p>
                <p className="text-xs text-morpheus-muted mt-0.5">
                  Select subjects and set your teaching proficiency level for each.
                </p>
              </div>
              <SubjectPicker
                subjects={subjects}
                value={selectedSubjects}
                onChange={setSelectedSubjects}
                isLoading={subjectsLoading}
              />
              {fieldErrors.subjects && (
                <p className="text-xs text-red-400">{fieldErrors.subjects}</p>
              )}
            </div>
          )}
        </div>

        {/* Upload progress bar */}
        {isLoading && uploadProgress > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-morpheus-muted">
              <span>Uploading files…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-morpheus-border overflow-hidden">
              <div
                className="h-full bg-morpheus-accent rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* API error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-morpheus-border px-5 py-2.5",
                "text-sm text-morpheus-text hover:bg-morpheus-surface transition-colors",
                "disabled:opacity-50"
              )}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
                "bg-morpheus-accent text-white text-sm font-medium",
                "transition-all shadow-lg shadow-morpheus-accent/25 hover:bg-morpheus-accent/90"
              )}
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
                "bg-morpheus-accent text-white text-sm font-medium",
                "transition-all shadow-lg shadow-morpheus-accent/25 hover:bg-morpheus-accent/90",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit for review →"
              )}
            </button>
          )}
        </div>
      </form>
    </OnboardingLayout>
  );
}
