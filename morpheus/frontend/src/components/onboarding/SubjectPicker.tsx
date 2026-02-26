import { useState } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Subject, SubjectSelection, SubjectLevel } from "../../types/onboarding.types";

interface SubjectPickerProps {
  subjects: Subject[];
  value: SubjectSelection[];
  onChange: (selections: SubjectSelection[]) => void;
  isLoading?: boolean;
}

const levels: { value: SubjectLevel; label: string; color: string }[] = [
  { value: "beginner", label: "Beginner", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { value: "medium", label: "Medium", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { value: "advanced", label: "Advanced", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
];

export default function SubjectPicker({
  subjects,
  value,
  onChange,
  isLoading,
}: SubjectPickerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedIds = new Set(value.map((s) => s.subjectId));

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedIds.has(s.id)
  );

  const addSubject = (subject: Subject) => {
    onChange([...value, { subjectId: subject.id, level: "beginner" }]);
    setSearch("");
    setIsOpen(false);
  };

  const removeSubject = (subjectId: string) => {
    onChange(value.filter((s) => s.subjectId !== subjectId));
  };

  const updateLevel = (subjectId: string, level: SubjectLevel) => {
    onChange(
      value.map((s) => (s.subjectId === subjectId ? { ...s, level } : s))
    );
  };

  const getSubjectName = (subjectId: string) =>
    subjects.find((s) => s.id === subjectId)?.name || subjectId;

  return (
    <div className="space-y-3">
      {/* Selected subjects */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((sel) => (
            <div
              key={sel.subjectId}
              className="flex items-center gap-3 rounded-xl border border-morpheus-border bg-morpheus-surface px-4 py-3"
            >
              {/* Subject name */}
              <span className="flex-1 text-sm font-medium text-morpheus-text">
                {getSubjectName(sel.subjectId)}
              </span>

              {/* Level pills */}
              <div className="flex gap-1.5">
                {levels.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => updateLevel(sel.subjectId, lvl.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg border text-xs font-medium transition-all",
                      sel.level === lvl.value
                        ? lvl.color
                        : "text-morpheus-muted border-morpheus-border hover:border-morpheus-accent/30"
                    )}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeSubject(sel.subjectId)}
                className="text-morpheus-muted hover:text-red-400 transition-colors ml-1"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search + dropdown */}
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-2.5 cursor-text",
            "bg-morpheus-surface border-morpheus-border",
            "focus-within:border-morpheus-accent focus-within:ring-2 focus-within:ring-morpheus-accent/20",
            "transition-all"
          )}
          onClick={() => setIsOpen(true)}
        >
          <Plus size={16} className="text-morpheus-muted shrink-0" />
          <input
            type="text"
            placeholder={
              isLoading ? "Loading subjects..." : "Search and add a subject..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-morpheus-text placeholder:text-morpheus-muted outline-none"
          />
          <ChevronDown
            size={16}
            className={cn(
              "text-morpheus-muted transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>

        {/* Dropdown */}
        {isOpen && filtered.length > 0 && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1.5 z-20 rounded-xl border border-morpheus-border bg-morpheus-surface shadow-xl shadow-black/30 overflow-hidden max-h-52 overflow-y-auto">
              {filtered.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => addSubject(subject)}
                  className="w-full text-left px-4 py-2.5 text-sm text-morpheus-text hover:bg-morpheus-accent/10 hover:text-morpheus-accent transition-colors"
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </>
        )}

        {isOpen && search && filtered.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-20 rounded-xl border border-morpheus-border bg-morpheus-surface px-4 py-3">
            <p className="text-sm text-morpheus-muted">No subjects found.</p>
          </div>
        )}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-morpheus-muted">
          Add at least one subject to continue.
        </p>
      )}
    </div>
  );
}
