import { requireAdmin } from "@/lib/admin/auth";
import { listThreads } from "@/lib/assistant/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { AssistantChatInput } from "@/components/admin/assistant/AssistantChatInput";
import { AssistantThreadList } from "@/components/admin/assistant/AssistantThreadList";
import { NewChatButton } from "@/components/admin/assistant/NewChatButton";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AssistantIndexPage() {
  await requireAdmin();
  const threads = await listThreads();

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assistant</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Ask about bookings and the latest SEO checks. Chats are saved so
            you can continue later.
          </p>
        </div>
        <NewChatButton />
      </div>

      <div className="mt-10">
        <AssistantChatInput />
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent chats
        </h2>
        <AssistantThreadList threads={threads} />
      </div>
    </AdminShell>
  );
}
