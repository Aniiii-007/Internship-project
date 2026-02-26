import { useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import OnboardingLayout from "../../components/onboarding/OnboardingLayout";
import SubjectPicker from "../../components/onboarding/SubjectPicker";
import { useStudentOnboarding, useSubjects } from "../../hooks/useOnboarding";
import { cn } from "../../lib/utils";
import type { SubjectSelection } from "../../types/onboarding.types";

// ─── Reusable field components ────────────────────────────────────────────────

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

const GRADES = [
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12", "Undergraduate", "Postgraduate", "Other",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

import { ReactNode } from "react";

export default function StudentOnboardingPage() {
  const { completeProfile, isLoading, error, clearError } = useStudentOnboarding();
  const { subjects, isLoading: subjectsLoading } = useSubjects();

  const [form, setForm] = useState({
    grade: "",
    schoolName: "",
    bio: "",
  });
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectSelection[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.grade) errors.grade = "Please select your grade.";
    if (!form.schoolName.trim()) errors.schoolName = "School name is required.";
    if (selectedSubjects.length === 0)
      errors.subjects = "Add at least one subject.";
    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await completeProfile({
      grade: form.grade,
      schoolName: form.schoolName,
      bio: form.bio,
      subjects: selectedSubjects,
    });
  };

  return (
    <OnboardingLayout
      title="Set up your student profile"
      subtitle="Help us personalize your learning experience. This takes less than 2 minutes."
      steps={[{ number: 1, label: "Profile" }]}
      currentStep={1}
      role="student"
    >
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface/50 p-6 space-y-6">

          {/* Grade + School in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Current grade / level" error={fieldErrors.grade}>
              <select
                value={form.grade}
                onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                className={cn(inputClass, "cursor-pointer")}
              >
                <option value="" disabled>Select grade</option>
                {GRADES.map((g) => (
                  <option key={g} value={g} className="bg-morpheus-surface">
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="School / Institution name" error={fieldErrors.schoolName}>
              <input
                type="text"
                placeholder="e.g. Delhi Public School"
                value={form.schoolName}
                onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Bio */}
          <Field label="About you (optional)">
            <textarea
              placeholder="Tell tutors a bit about yourself, your learning goals..."
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
          </Field>

          {/* Divider */}
          <div className="border-t border-morpheus-border" />

          {/* Subject picker */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-morpheus-text">
                Subjects you want to learn
              </p>
              <p className="text-xs text-morpheus-muted mt-0.5">
                Select subjects and set your current level for each.
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
        </div>

        {/* API error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "mt-6 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3",
            "bg-morpheus-accent text-white text-sm font-medium",
            "transition-all duration-200 shadow-lg shadow-morpheus-accent/25",
            "hover:bg-morpheus-accent/90",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving profile…
            </>
          ) : (
            "Complete setup →"
          )}
        </button>
      </form>
    </OnboardingLayout>
  );
}
