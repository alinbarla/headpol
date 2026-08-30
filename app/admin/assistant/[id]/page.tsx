import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getThread, listMessages, listThreads } from "@/lib/assistant/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { AssistantChatInput } from "@/components/admin/assistant/AssistantChatInput";
import { AssistantThreadList } from "@/components/admin/assistant/AssistantThreadList";
import { AssistantTranscript } from "@/components/admin/assistant/AssistantTranscript";
import { NewChatButton } from "@/components/admin/assistant/NewChatButton";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AssistantThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [thread, messages, threads] = await Promise.all([
    getThread(id),
    listMessages(id),
    listThreads(),
  ]);

  if (!thread) notFound();

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/assistant"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground md:hidden"
          >
            <ArrowLeftIcon className="size-4" />
            All chats
          </Link>
          <h1 className="mt-2 text-2xl font-bold md:mt-0">{thread.title}</h1>
        </div>
        <NewChatButton />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Chats
          </p>
          <AssistantThreadList threads={threads} activeId={thread.id} />
        </aside>

        <div className="flex min-h-[60vh] flex-col">
          <div className="flex-1">
            <AssistantTranscript messages={messages} />
          </div>
          <div className="sticky bottom-20 z-10 mt-6 bg-background/95 pb-2 backdrop-blur md:bottom-4">
            <AssistantChatInput threadId={thread.id} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
