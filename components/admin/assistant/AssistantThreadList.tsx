import Link from "next/link";
import { formatTimestamp } from "@/lib/time";
import type { AssistantThread } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";

export function AssistantThreadList({
  threads,
  activeId,
}: {
  threads: AssistantThread[];
  activeId?: string;
}) {
  if (threads.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        No chats yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {threads.map((thread) => {
        const active = thread.id === activeId;
        return (
          <li key={thread.id}>
            <Link
              href={`/admin/assistant?thread=${thread.id}`}
              className={cn(
                "block rounded-xl border px-3 py-2 transition-colors",
                active
                  ? "border-primary/50 bg-secondary"
                  : "border-transparent hover:bg-muted"
              )}
            >
              <p className="truncate text-sm font-medium">{thread.title}</p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {formatTimestamp(thread.updated_at)}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
