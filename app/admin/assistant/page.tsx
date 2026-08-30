import { requireAdmin } from "@/lib/admin/auth";
import { getThread, listMessages, listThreads } from "@/lib/assistant/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { AssistantChat } from "@/components/admin/assistant/AssistantChat";
import { AssistantThreadList } from "@/components/admin/assistant/AssistantThreadList";
import { NewChatButton } from "@/components/admin/assistant/NewChatButton";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AssistantIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const raw = params.thread;
  const threadId = Array.isArray(raw) ? raw[0] : raw;

  const [threads, thread, messages] = await Promise.all([
    listThreads(),
    threadId ? getThread(threadId) : Promise.resolve(null),
    threadId ? listMessages(threadId) : Promise.resolve([]),
  ]);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {thread?.title ?? "Assistant"}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Conversation stays on this page. History is only for switching
            older chats.
          </p>
        </div>
        <NewChatButton />
      </div>

      <div className="mt-6 lg:hidden">
        <AssistantThreadList threads={threads} activeId={thread?.id} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Chats
          </p>
          <AssistantThreadList threads={threads} activeId={thread?.id} />
        </aside>
        <AssistantChat
          threadId={thread?.id}
          initialMessages={thread ? messages : []}
        />
      </div>
    </AdminShell>
  );
}
