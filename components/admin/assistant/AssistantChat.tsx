"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { askAssistantAction } from "@/app/admin/assistant/actions";
import { AssistantChatInput } from "@/components/admin/assistant/AssistantChatInput";
import { AssistantTranscript } from "@/components/admin/assistant/AssistantTranscript";
import type {
  AssistantAttachment,
  AssistantMessage,
} from "@/lib/assistant/types";
import { composeUserContent } from "@/lib/assistant/compose";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 18) return "Good evening";
  if (hour >= 12) return "Good afternoon";
  return "Good morning";
}

export function AssistantChat({
  threadId,
  initialMessages,
}: {
  threadId?: string;
  initialMessages: AssistantMessage[];
}) {
  const [activeThreadId, setActiveThreadId] = useState(threadId);
  const [messages, setMessages] = useState(initialMessages);
  const [pending, startTransition] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setActiveThreadId(threadId);
    setMessages(initialMessages);
  }, [threadId, initialMessages]);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  function send(data: {
    message: string;
    attachments: AssistantAttachment[];
    thinking: boolean;
  }) {
    const optimistic: AssistantMessage = {
      id: `local-${Date.now()}`,
      thread_id: activeThreadId ?? "local",
      role: "user",
      content: composeUserContent(data.message || "(attachment)", data.attachments),
      attachments: data.attachments,
      reasoning_content: null,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);

    startTransition(async () => {
      const result = await askAssistantAction({
        threadId: activeThreadId,
        message: data.message,
        attachments: data.attachments,
        thinking: data.thinking,
      });

      if (!result.ok) {
        setMessages((current) => current.filter((row) => row.id !== optimistic.id));
        toast.error(result.message ?? "Could not send.");
        return;
      }

      if (result.threadId && result.threadId !== activeThreadId) {
        setActiveThreadId(result.threadId);
        router.replace(`/admin/assistant?thread=${result.threadId}`, {
          scroll: false,
        });
      }

      if (result.reply) {
        setMessages((current) => [
          ...current,
          {
            id: `reply-${Date.now()}`,
            thread_id: result.threadId ?? activeThreadId ?? "local",
            role: "assistant",
            content: result.reply!,
            attachments: [],
            reasoning_content: null,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      router.refresh();
    });
  }

  const empty = messages.length === 0 && !pending;

  return (
    <div className="flex min-h-[calc(100dvh-10rem)] flex-col">
      <div ref={scroller} className="flex-1 overflow-y-auto pb-6">
        {empty ? (
          <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-8 pt-10 text-center">
            <p className="text-3xl font-light tracking-tight">
              {greeting()}.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask about bookings or SEO. Replies stay on this page.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl px-1">
            <AssistantTranscript messages={messages} thinking={pending} />
          </div>
        )}
      </div>

      <div className="sticky bottom-20 z-10 bg-background/95 pt-2 pb-2 backdrop-blur md:bottom-4">
        <AssistantChatInput pending={pending} onSend={send} />
      </div>
    </div>
  );
}
