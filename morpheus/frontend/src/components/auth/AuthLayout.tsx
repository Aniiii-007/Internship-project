import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  /** Quote shown on the decorative panel */
  quote?: string;
  quoteAuthor?: string;
}

// ─── Decorative Brand Panel ───────────────────────────────────────────────────

function BrandPanel({
  quote = "The beautiful thing about learning is that nobody can take it away from you.",
  quoteAuthor = "B.B. King",
}: {
  quote?: string;
  quoteAuthor?: string;
}) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full bg-morpheus-dark p-12 overflow-hidden">
      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-morpheus-accent/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-morpheus-accent/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-morpheus-accent/5 blur-2xl" />

      {/* Logo */}
      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-morpheus-accent flex items-center justify-center shadow-lg shadow-morpheus-accent/30">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 2L19.5 7V15L11 20L2.5 15V7L11 2Z"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M11 6L15.5 8.5V13.5L11 16L6.5 13.5V8.5L11 6Z"
                fill="white"
                fillOpacity="0.3"
              />
              <circle cx="11" cy="11" r="2" fill="white" />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold text-white tracking-tight">
            Morpheus
          </span>
        </Link>
      </div>

      {/* Center visual: floating stat cards */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Main card */}
        <div className="w-72 rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-morpheus-accent/20 border border-morpheus-accent/30 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2a5 5 0 100 10A5 5 0 009 2zm0 12c-3.33 0-6 1.34-6 3h12c0-1.66-2.67-3-6-3z" fill="rgb(139 92 246)" />
              </svg>
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium font-display">Priya Sharma</p>
              <p className="text-white/40 text-xs">Mathematics Tutor</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs">Live</span>
            </div>
          </div>
          <div className="flex gap-3">
            {["Algebra", "Calculus", "Statistics"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-morpheus-accent/15 text-morpheus-accent border border-morpheus-accent/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Floating stat pills */}
        <div className="flex gap-3">
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-white text-lg font-semibold font-display">2.4k+</p>
            <p className="text-white/40 text-xs">Tutors</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-morpheus-accent text-lg font-semibold font-display">4.9★</p>
            <p className="text-white/40 text-xs">Avg Rating</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-white text-lg font-semibold font-display">98%</p>
            <p className="text-white/40 text-xs">Success</p>
          </div>
        </div>
      </div>

      {/* Bottom quote */}
      <div className="relative z-10">
        <blockquote className="border-l-2 border-morpheus-accent/50 pl-4">
          <p className="text-white/60 text-sm leading-relaxed italic">
            "{quote}"
          </p>
          <cite className="text-white/30 text-xs mt-2 block not-italic">
            — {quoteAuthor}
          </cite>
        </blockquote>
      </div>
    </div>
  );
}

// ─── Auth Layout ──────────────────────────────────────────────────────────────

export default function AuthLayout({
  children,
  title,
  subtitle,
  quote,
  quoteAuthor,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-morpheus-bg">
      {/* Left: Brand Panel */}
      <BrandPanel quote={quote} quoteAuthor={quoteAuthor} />

      {/* Right: Form Panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-morpheus-accent flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L19.5 7V15L11 20L2.5 15V7L11 2Z" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="11" cy="11" r="2" fill="white" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-morpheus-text tracking-tight">
              Morpheus
            </span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-morpheus-text tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-morpheus-muted text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Form content */}
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
