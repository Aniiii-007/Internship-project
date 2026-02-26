import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "../../lib/utils";

interface Props {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, onTyping, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onTyping();
    // Auto-resize
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="flex items-end gap-3 p-4 border-t border-morpheus-border bg-morpheus-bg">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        rows={1}
        disabled={disabled}
        className={cn(
          "flex-1 resize-none rounded-2xl bg-morpheus-surface border border-morpheus-border",
          "px-4 py-2.5 text-sm text-morpheus-text placeholder:text-morpheus-muted",
          "focus:outline-none focus:border-morpheus-accent/50 transition-colors",
          "disabled:opacity-50 max-h-[120px] leading-relaxed"
        )}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
          canSend
            ? "bg-morpheus-accent text-white hover:bg-morpheus-accent/90 shadow-lg shadow-morpheus-accent/20"
            : "bg-morpheus-surface border border-morpheus-border text-morpheus-muted opacity-50 cursor-not-allowed"
        )}
      >
        <Send size={16} />
      </button>
    </div>
  );
}
