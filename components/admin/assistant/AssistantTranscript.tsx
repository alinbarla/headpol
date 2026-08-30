import { FilePreviewCard } from "@/components/admin/assistant/FilePreviewCard";
import type { AssistantMessage } from "@/lib/assistant/types";
import { formatTimestamp } from "@/lib/time";
import { cn } from "@/lib/utils";

export function ThinkingBubble() {
  return (
    <article className="flex justify-start">
      <div className="max-w-[min(40rem,92%)] rounded-2xl border border-border bg-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Assistant
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex gap-1" aria-hidden>
            <span className="assistant-dot size-1.5 rounded-full bg-primary" />
            <span className="assistant-dot size-1.5 rounded-full bg-primary" />
            <span className="assistant-dot size-1.5 rounded-full bg-primary" />
          </span>
          Thinking and typing…
        </div>
      </div>
    </article>
  );
}

export function AssistantTranscript({
  messages,
  thinking,
}: {
  messages: AssistantMessage[];
  thinking?: boolean;
}) {
  if (messages.length === 0 && !thinking) {
    return null;
  }

  return (
    <div className="space-y-3">
      {messages.map((row) => {
        const mine = row.role === "user";
        return (
          <article
            key={row.id}
            className={cn("flex", mine ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[min(40rem,92%)] rounded-2xl border px-4 py-3",
                mine
                  ? "border-primary/40 bg-secondary"
                  : "border-border bg-card"
              )}
            >
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {mine ? "You" : "Assistant"}
                <span className="ml-2 font-normal normal-case tabular-nums">
                  {formatTimestamp(row.created_at)}
                </span>
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {row.content}
              </p>
              {row.attachments.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.attachments.map((file, index) => (
                    <FilePreviewCard
                      key={`${row.id}-${file.name}-${index}`}
                      file={file}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
      {thinking ? <ThinkingBubble /> : null}
    </div>
  );
}
