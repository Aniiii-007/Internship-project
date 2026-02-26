import { useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, FileVideo, Image } from "lucide-react";
import { cn } from "../../lib/utils";

interface FileUploadFieldProps {
  label: string;
  accept: string;
  type: "video" | "image";
  value: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploadField({
  label,
  accept,
  type,
  value,
  onChange,
  hint,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onChange(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  const Icon = type === "video" ? FileVideo : Image;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-morpheus-text">
        {label}
      </label>

      {value ? (
        /* File selected state */
        <div className="flex items-center gap-3 rounded-xl border border-morpheus-accent/30 bg-morpheus-accent/5 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-morpheus-accent/15 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-morpheus-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-morpheus-text font-medium truncate">
              {value.name}
            </p>
            <p className="text-xs text-morpheus-muted">{formatBytes(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-morpheus-muted hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer",
            "border-morpheus-border hover:border-morpheus-accent/50 hover:bg-morpheus-accent/3",
            "transition-all duration-200 text-center"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-morpheus-surface border border-morpheus-border flex items-center justify-center">
            <Upload size={18} className="text-morpheus-muted" />
          </div>
          <div>
            <p className="text-sm text-morpheus-text">
              <span className="text-morpheus-accent font-medium">Click to upload</span>{" "}
              or drag & drop
            </p>
            {hint && <p className="text-xs text-morpheus-muted mt-0.5">{hint}</p>}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
