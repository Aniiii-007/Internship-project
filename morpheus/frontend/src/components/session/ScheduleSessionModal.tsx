import { useState, useEffect } from "react";
import { X, Calendar, Clock, BookOpen, FileText, Loader2 } from "lucide-react";
import { useSocketStore } from "../../store/socket.store";
import { cn } from "../../lib/utils";
import api from "../../api/axios";

interface Subject {
  id: string;
  name: string;
}

interface Props {
  conversationId: string;
  onClose: () => void;
}

export default function ScheduleSessionModal({ conversationId, onClose }: Props) {
  const { socket } = useSocketStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    subjectId: "",
    topic: "",
    date: "",
    time: "",
  });

  // Fetch subjects list
  useEffect(() => {
    api.get("/api/subjects").then((r) => {
      setSubjects(r.data ?? []);
    }).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid = form.subjectId && form.topic.trim() && form.date && form.time;

  const handleSend = () => {
    if (!isValid || !socket) return;

    // Combine date + time into ISO string
    const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();

    setIsSending(true);
    socket.emit("send_schedule_request", {
      conversationId,
      subjectId: form.subjectId,
      topic: form.topic.trim(),
      scheduledAt,
    });

    // Close after short delay
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setTimeout(onClose, 1000);
    }, 600);
  };

  // Min date = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-morpheus-border bg-morpheus-bg shadow-2xl shadow-black/40 z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-morpheus-border">
          <div>
            <h2 className="font-display text-lg font-semibold text-morpheus-text">
              Schedule a Session
            </h2>
            <p className="text-xs text-morpheus-muted mt-0.5">
              Propose a session time to your student
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-morpheus-border text-morpheus-muted hover:text-morpheus-text flex items-center justify-center transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Subject */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-morpheus-muted mb-1.5">
              <BookOpen size={13} />
              Subject
            </label>
            <select
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
              className={cn(
                "w-full rounded-xl bg-morpheus-surface border border-morpheus-border",
                "px-4 py-2.5 text-sm text-morpheus-text",
                "focus:outline-none focus:border-morpheus-accent/50 transition-colors"
              )}
            >
              <option value="">Select a subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-morpheus-muted mb-1.5">
              <FileText size={13} />
              Topic to cover
            </label>
            <input
              name="topic"
              value={form.topic}
              onChange={handleChange}
              placeholder="e.g. Integration by parts, Chain rule..."
              className={cn(
                "w-full rounded-xl bg-morpheus-surface border border-morpheus-border",
                "px-4 py-2.5 text-sm text-morpheus-text placeholder:text-morpheus-muted",
                "focus:outline-none focus:border-morpheus-accent/50 transition-colors"
              )}
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-morpheus-muted mb-1.5">
                <Calendar size={13} />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                min={today}
                onChange={handleChange}
                className={cn(
                  "w-full rounded-xl bg-morpheus-surface border border-morpheus-border",
                  "px-4 py-2.5 text-sm text-morpheus-text",
                  "focus:outline-none focus:border-morpheus-accent/50 transition-colors"
                )}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-morpheus-muted mb-1.5">
                <Clock size={13} />
                Time
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className={cn(
                  "w-full rounded-xl bg-morpheus-surface border border-morpheus-border",
                  "px-4 py-2.5 text-sm text-morpheus-text",
                  "focus:outline-none focus:border-morpheus-accent/50 transition-colors"
                )}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-morpheus-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-morpheus-border text-sm text-morpheus-muted hover:text-morpheus-text transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!isValid || isSending || sent}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all",
              sent
                ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
                : isValid
                ? "bg-morpheus-accent text-white hover:bg-morpheus-accent/90"
                : "bg-morpheus-surface border border-morpheus-border text-morpheus-muted opacity-50 cursor-not-allowed"
            )}
          >
            {isSending ? (
              <><Loader2 size={15} className="animate-spin" /> Sending...</>
            ) : sent ? (
              "✓ Sent!"
            ) : (
              "Send Proposal"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
