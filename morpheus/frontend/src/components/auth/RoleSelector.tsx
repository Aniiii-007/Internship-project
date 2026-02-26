import { cn } from "../../lib/utils";
import type { UserRole } from "../../types/auth.types";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

const roles: Array<{
  value: UserRole;
  label: string;
  description: string;
  icon: JSX.Element;
}> = [
  {
    value: "student",
    label: "Student",
    description: "Find expert tutors",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    value: "tutor",
    label: "Tutor",
    description: "Teach & earn",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 10-16 0" />
        <path d="M15 8l2 2 4-4" />
      </svg>
    ),
  },
];

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role) => {
        const isSelected = value === role.value;
        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value as UserRole)}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200",
              isSelected
                ? "border-morpheus-accent bg-morpheus-accent/8 shadow-sm"
                : "border-morpheus-border bg-morpheus-surface hover:border-morpheus-accent/40 hover:bg-morpheus-surface"
            )}
          >
            {/* Selection indicator */}
            <span
              className={cn(
                "absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected
                  ? "border-morpheus-accent bg-morpheus-accent"
                  : "border-morpheus-border"
              )}
            >
              {isSelected && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>

            {/* Icon */}
            <span
              className={cn(
                "transition-colors",
                isSelected ? "text-morpheus-accent" : "text-morpheus-muted"
              )}
            >
              {role.icon}
            </span>

            {/* Text */}
            <div>
              <p
                className={cn(
                  "text-sm font-medium transition-colors font-display",
                  isSelected ? "text-morpheus-accent" : "text-morpheus-text"
                )}
              >
                {role.label}
              </p>
              <p className="text-xs text-morpheus-muted mt-0.5">
                {role.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
