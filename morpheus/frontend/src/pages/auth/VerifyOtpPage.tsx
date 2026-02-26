import { useState, useEffect, FormEvent } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Loader2, MailOpen, RefreshCw } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import OtpInput from "../../components/auth/OtpInput";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtpPage() {
  const location = useLocation();
  const email = location.state?.email as string | undefined;

  const { verifyEmail, resendOtp, isLoading, error, clearError } = useAuth();

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Guard: if no email in state, redirect to signup
  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    clearError();
    await verifyEmail({ email, otp });
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    clearError();
    setResendSuccess(false);
    await resendOtp(email);
    setResendSuccess(true);
    setCanResend(false);
    setCountdown(RESEND_COOLDOWN);
    setOtp("");
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) =>
    a + "*".repeat(b.length) + c
  );

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We've sent a 6-digit code to ${maskedEmail}`}
      quote="Patience is not the ability to wait, but the ability to keep a good attitude while waiting."
      quoteAuthor="Joyce Meyer"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-morpheus-accent/10 border border-morpheus-accent/20 flex items-center justify-center">
            <MailOpen size={28} className="text-morpheus-accent" />
          </div>
        </div>

        {/* OTP Input */}
        <div className="space-y-3">
          <OtpInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              clearError();
            }}
            hasError={!!error}
            disabled={isLoading}
          />
          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Resend success */}
        {resendSuccess && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
            <p className="text-sm text-center text-emerald-400">
              A new code has been sent to your email.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || otp.length < 6}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
            "bg-morpheus-accent text-white text-sm font-medium",
            "transition-all duration-200 shadow-lg shadow-morpheus-accent/25",
            "hover:bg-morpheus-accent/90",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifying…
            </>
          ) : (
            "Verify email"
          )}
        </button>

        {/* Resend */}
        <div className="text-center space-y-1">
          <p className="text-sm text-morpheus-muted">Didn't receive the code?</p>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-sm text-morpheus-accent font-medium hover:underline disabled:opacity-60"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Resend code
            </button>
          ) : (
            <p className="text-sm text-morpheus-muted">
              Resend in{" "}
              <span className="text-morpheus-text font-medium tabular-nums">
                {countdown}s
              </span>
            </p>
          )}
        </div>

        {/* Wrong email */}
        <p className="text-center text-xs text-morpheus-muted">
          Wrong email?{" "}
          <a
            href="/signup"
            className="text-morpheus-accent hover:underline"
          >
            Go back
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
