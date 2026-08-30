import { FileTextIcon, XIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import type { AssistantAttachment } from "@/lib/assistant/types";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreviewCard({
  file,
  onRemove,
}: {
  file: AssistantAttachment;
  onRemove?: () => void;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-xl border border-border bg-muted px-3 py-2">
      <FileTextIcon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {file.type || "file"} · {formatSize(file.size)}
        </p>
        {file.text ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {file.text}
          </p>
        ) : null}
      </div>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
        >
          <XIcon className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
