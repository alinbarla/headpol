import { FileTextIcon, XIcon } from "lucide-react";
import type { AssistantAttachment } from "@/lib/assistant/types";

function formatFileSize(bytes: number) {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export type DraftAttachment = AssistantAttachment & {
  id: string;
  preview?: string;
  kind?: "file" | "paste" | "dashboard";
};

export function FilePreviewCard({
  file,
  onRemove,
}: {
  file: DraftAttachment | AssistantAttachment;
  onRemove?: () => void;
}) {
  const draft = file as DraftAttachment;
  const isImage = Boolean(draft.preview) || file.type.startsWith("image/");
  const isPaste = draft.kind === "paste" || draft.kind === "dashboard";

  return (
    <div className="group relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
      {isImage && draft.preview ? (
        <img
          src={draft.preview}
          alt={file.name}
          className="size-full object-cover"
        />
      ) : isPaste ? (
        <div className="flex h-full flex-col justify-between p-2.5">
          <p className="line-clamp-3 font-mono text-[10px] leading-snug text-muted-foreground">
            {file.text}
          </p>
          <span className="w-fit rounded border border-border px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            {draft.kind === "dashboard" ? "Dashboard" : "Pasted"}
          </span>
        </div>
      ) : (
        <div className="flex h-full flex-col justify-between p-2.5">
          <FileTextIcon className="size-4 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium" title={file.name}>
              {file.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
      )}

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </div>
  );
}
