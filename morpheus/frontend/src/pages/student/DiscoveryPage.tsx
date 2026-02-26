import { useState, FormEvent } from "react";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import StudentLayout from "../../components/shared/StudentLayout";
import TutorCard from "../../components/tutor/TutorCard";
import { useSearch, useConnections } from "../../hooks/useStudent";
import { useSubjects } from "../../hooks/useOnboarding";
import { cn } from "../../lib/utils";
import type { SubjectLevel } from "../../types/onboarding.types";

const levels: { value: SubjectLevel | ""; label: string }[] = [
  { value: "", label: "Any level" },
  { value: "beginner", label: "Beginner" },
  { value: "medium", label: "Medium" },
  { value: "advanced", label: "Advanced" },
];

export default function DiscoveryPage() {
  const { tutors, total, isLoading, search } = useSearch();
  const { sendRequest, sendingId, getConnectionStatus } = useConnections();
  const { subjects } = useSubjects();

  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    subjectName: "",
    level: "" as SubjectLevel | "",
    minExperience: "",
    minRating: "",
  });

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    search({
      subjectName: filters.subjectName || undefined,
      level: (filters.level as SubjectLevel) || undefined,
      minExperience: filters.minExperience
        ? Number(filters.minExperience)
        : undefined,
      minRating: filters.minRating ? Number(filters.minRating) : undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    setFilters({ subjectName: "", level: "", minExperience: "", minRating: "" });
    setQuery("");
    search({ page: 1 });
  };

  const hasActiveFilters =
    filters.subjectName || filters.level || filters.minExperience || filters.minRating;

  const inputClass = cn(
    "w-full rounded-xl border px-3 py-2 text-sm",
    "bg-morpheus-surface text-morpheus-text placeholder:text-morpheus-muted",
    "border-morpheus-border focus:border-morpheus-accent focus:ring-2 focus:ring-morpheus-accent/20",
    "outline-none transition-all"
  );

  return (
    <StudentLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Find Tutors
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          {total > 0 ? `${total} tutors available` : "Search for expert tutors"}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-morpheus-muted"
            />
            <input
              type="text"
              placeholder="Search by subject..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setFilters((f) => ({ ...f, subjectName: e.target.value }));
              }}
              className={cn(inputClass, "pl-10")}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-4 rounded-xl border text-sm font-medium transition-all",
              showFilters || hasActiveFilters
                ? "border-morpheus-accent bg-morpheus-accent/10 text-morpheus-accent"
                : "border-morpheus-border text-morpheus-muted hover:text-morpheus-text hover:border-morpheus-accent/40"
            )}
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-morpheus-accent" />
            )}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 rounded-xl bg-morpheus-accent text-white text-sm font-medium hover:bg-morpheus-accent/90 transition-all disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
          </button>
        </div>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-5 rounded-2xl border border-morpheus-border bg-morpheus-surface p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Subject filter */}
            <div>
              <label className="block text-xs font-medium text-morpheus-muted mb-1.5">
                Subject
              </label>
              <select
                value={filters.subjectName}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, subjectName: e.target.value }))
                }
                className={cn(inputClass, "cursor-pointer")}
              >
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name} className="bg-morpheus-surface">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level filter */}
            <div>
              <label className="block text-xs font-medium text-morpheus-muted mb-1.5">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    level: e.target.value as SubjectLevel | "",
                  }))
                }
                className={cn(inputClass, "cursor-pointer")}
              >
                {levels.map((l) => (
                  <option key={l.value} value={l.value} className="bg-morpheus-surface">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min experience */}
            <div>
              <label className="block text-xs font-medium text-morpheus-muted mb-1.5">
                Min. experience (years)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 2"
                value={filters.minExperience}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minExperience: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            {/* Min rating */}
            <div>
              <label className="block text-xs font-medium text-morpheus-muted mb-1.5">
                Min. rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minRating: e.target.value }))
                }
                className={cn(inputClass, "cursor-pointer")}
              >
                <option value="">Any rating</option>
                {[3, 3.5, 4, 4.5].map((r) => (
                  <option key={r} value={r} className="bg-morpheus-surface">
                    {r}★ & above
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 rounded-xl bg-morpheus-accent text-white text-sm font-medium hover:bg-morpheus-accent/90 transition-all"
            >
              Apply filters
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-morpheus-border text-sm text-morpheus-muted hover:text-morpheus-text transition-all"
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 rounded-2xl border border-morpheus-border bg-morpheus-surface animate-pulse"
            />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <Search size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">No tutors found</p>
          <p className="text-morpheus-muted text-sm mt-1">
            Try adjusting your filters or search term.
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-morpheus-accent hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              connectionStatus={getConnectionStatus(tutor.id)}
              isSending={sendingId === tutor.id}
              onConnect={sendRequest}
            />
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
