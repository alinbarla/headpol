import { FilePreviewCard } from "@/components/admin/assistant/FilePreviewCard";
import type { AssistantMessage } from "@/lib/assistant/types";
import { formatTimestamp } from "@/lib/time";
import { cn } from "@/lib/utils";

export function AssistantTranscript({
  messages,
}: {
  messages: AssistantMessage[];
}) {
  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Ask about bookings or SEO. This chat is saved so you can pick it up
        later.
      </p>
    );
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
                <div className="mt-3 grid gap-2">
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
    </div>
  );
}
