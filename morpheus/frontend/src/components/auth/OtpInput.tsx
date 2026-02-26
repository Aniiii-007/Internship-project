import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { cn } from "../../lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
  hasError?: boolean;
  disabled?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  hasError = false,
  disabled = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const focusAt = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ""); // digits only
    if (!raw) {
      // Deletion via onChange (mobile)
      const next = digits.map((d, i) => (i === index ? "" : d));
      onChange(next.join(""));
      return;
    }

    // If user typed/pasted multiple chars in a single box
    if (raw.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < raw.length && index + i < length; i++) {
        newDigits[index + i] = raw[i];
      }
      onChange(newDigits.join(""));
      const nextFocus = Math.min(index + raw.length, length - 1);
      focusAt(nextFocus);
      return;
    }

    const newDigits = digits.map((d, i) => (i === index ? raw : d));
    onChange(newDigits.join(""));
    if (index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        // Clear current box
        const newDigits = digits.map((d, i) => (i === index ? "" : d));
        onChange(newDigits.join(""));
      } else if (index > 0) {
        // Move to previous
        const newDigits = digits.map((d, i) => (i === index - 1 ? "" : d));
        onChange(newDigits.join(""));
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const newDigits = Array(length)
      .fill("")
      .map((_, i) => pasted[i] || "");
    onChange(newDigits.join(""));
    focusAt(Math.min(pasted.length - 1, length - 1));
  };

  return (
    <div className="flex gap-2.5 justify-between">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-12 h-14 rounded-xl border text-center text-lg font-semibold font-display",
            "transition-all duration-200 outline-none",
            "bg-morpheus-surface text-morpheus-text placeholder-morpheus-muted",
            "focus:ring-2 focus:ring-offset-0",
            hasError
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              : digit
              ? "border-morpheus-accent focus:border-morpheus-accent focus:ring-morpheus-accent/20"
              : "border-morpheus-border focus:border-morpheus-accent focus:ring-morpheus-accent/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}
