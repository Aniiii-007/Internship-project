import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import RoleSelector from "../../components/auth/RoleSelector";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import type { UserRole } from "../../types/auth.types";

// ─── Password strength helpers ────────────────────────────────────────────────

function getStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthConfig = [
  { label: "Too short", color: "bg-red-500" },
  { label: "Weak", color: "bg-orange-500" },
  { label: "Fair", color: "bg-yellow-500" },
  { label: "Good", color: "bg-emerald-400" },
  { label: "Strong", color: "bg-emerald-500" },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = getStrength(password);
  const cfg = strengthConfig[score];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? cfg.color : "bg-morpheus-border"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-morpheus-muted">{cfg.label}</p>
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({
  label,
  id,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-morpheus-text">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "w-full rounded-xl border px-4 py-2.5 text-sm",
          "bg-morpheus-surface text-morpheus-text placeholder:text-morpheus-muted",
          "outline-none transition-all duration-200",
          "focus:ring-2 focus:ring-offset-0 focus:ring-morpheus-accent/25 focus:border-morpheus-accent",
          error
            ? "border-red-500/60"
            : "border-morpheus-border hover:border-morpheus-accent/40"
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Signup Page ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  const { signup, isLoading, error, clearError } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Full name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Enter a valid email address.";
    if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await signup(form);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Morpheus and unlock personalized learning experiences."
      quote="Education is the most powerful weapon which you can use to change the world."
      quoteAuthor="Nelson Mandela"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role selector */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-morpheus-text">I am a</p>
          <RoleSelector
            value={form.role}
            onChange={(role) => setForm((f) => ({ ...f, role }))}
          />
        </div>

        {/* Name */}
        <InputField
          label="Full name"
          id="name"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={fieldErrors.name}
        />

        {/* Email */}
        <InputField
          label="Email address"
          id="email"
          type="email"
          placeholder="jane@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={fieldErrors.email}
        />

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-morpheus-text">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={cn(
                "w-full rounded-xl border px-4 py-2.5 pr-10 text-sm",
                "bg-morpheus-surface text-morpheus-text placeholder:text-morpheus-muted",
                "outline-none transition-all duration-200",
                "focus:ring-2 focus:ring-offset-0 focus:ring-morpheus-accent/25 focus:border-morpheus-accent",
                fieldErrors.password
                  ? "border-red-500/60"
                  : "border-morpheus-border hover:border-morpheus-accent/40"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-morpheus-muted hover:text-morpheus-text transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-400">{fieldErrors.password}</p>
          )}
          <PasswordStrength password={form.password} />
        </div>

        {/* API Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
            "bg-morpheus-accent text-white text-sm font-medium",
            "transition-all duration-200 shadow-lg shadow-morpheus-accent/25",
            "hover:bg-morpheus-accent/90 hover:shadow-morpheus-accent/40",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-morpheus-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-morpheus-accent font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
