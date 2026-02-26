import { useState, FormEvent, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [justVerified, setJustVerified] = useState(false);

  // Show success banner if navigated from OTP verification
  useEffect(() => {
    if (location.state?.verified) {
      setJustVerified(true);
      // Pre-fill email if passed via state
      if (location.state?.email) {
        setForm((f) => ({ ...f, email: location.state.email }));
      }
    }
  }, [location.state]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.email.trim()) errors.email = "Email is required.";
    if (!form.password) errors.password = "Password is required.";
    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await login(form);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Morpheus account to continue learning."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Verified success banner */}
        {justVerified && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-400">
              Email verified! You can sign in now.
            </p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-morpheus-text">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={cn(
              "w-full rounded-xl border px-4 py-2.5 text-sm",
              "bg-morpheus-surface text-morpheus-text placeholder:text-morpheus-muted",
              "outline-none transition-all duration-200",
              "focus:ring-2 focus:ring-offset-0 focus:ring-morpheus-accent/25 focus:border-morpheus-accent",
              fieldErrors.email
                ? "border-red-500/60"
                : "border-morpheus-border hover:border-morpheus-accent/40"
            )}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-morpheus-text">
              Password
            </label>
            {/* Placeholder for future forgot-password route */}
            <Link
              to="/forgot-password"
              className="text-xs text-morpheus-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              autoComplete="current-password"
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
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>

        {/* Signup link */}
        <p className="text-center text-sm text-morpheus-muted">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-morpheus-accent font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
