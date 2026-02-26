import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface Step {
  number: number;
  label: string;
}

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  steps: Step[];
  currentStep: number;
  role: "student" | "tutor";
}

export default function OnboardingLayout({
  children,
  title,
  subtitle,
  steps,
  currentStep,
  role,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-morpheus-bg">
      {/* Top bar */}
      <div className="border-b border-morpheus-border bg-morpheus-bg/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-morpheus-accent flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L19.5 7V15L11 20L2.5 15V7L11 2Z" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="11" cy="11" r="2" fill="white" />
              </svg>
            </div>
            <span className="font-display text-lg font-semibold text-morpheus-text">
              Morpheus
            </span>
          </div>

          {/* Role badge */}
          <span className={cn(
            "text-xs font-medium px-3 py-1 rounded-full border",
            role === "student"
              ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
              : "text-violet-400 bg-violet-400/10 border-violet-400/20"
          )}>
            {role === "student" ? "Student Setup" : "Tutor Setup"}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Step indicator */}
        {steps.length > 1 && (
          <div className="flex items-center gap-2 mb-8">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                    step.number < currentStep
                      ? "bg-morpheus-accent text-white"
                      : step.number === currentStep
                      ? "bg-morpheus-accent text-white ring-4 ring-morpheus-accent/20"
                      : "bg-morpheus-surface border border-morpheus-border text-morpheus-muted"
                  )}>
                    {step.number < currentStep ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L4.5 8.5L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:block",
                    step.number === currentStep ? "text-morpheus-text" : "text-morpheus-muted"
                  )}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "h-px flex-1 min-w-8 transition-colors",
                    step.number < currentStep ? "bg-morpheus-accent" : "bg-morpheus-border"
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-morpheus-text tracking-tight">
            {title}
          </h1>
          <p className="mt-1.5 text-morpheus-muted text-sm">{subtitle}</p>
        </div>

        {/* Form content */}
        {children}
      </div>
    </div>
  );
}
