import { requireAdmin } from "@/lib/admin/auth";
import { listThreads } from "@/lib/assistant/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { AssistantThreadList } from "@/components/admin/assistant/AssistantThreadList";
import { NewChatButton } from "@/components/admin/assistant/NewChatButton";

export const dynamic = "force-dynamic";

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

      <div className="mt-6 max-w-xl">
        <AssistantThreadList threads={threads} />
      </div>
    </AdminShell>
  );
}
