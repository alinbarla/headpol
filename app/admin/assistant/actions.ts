"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/app/admin/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import {
  buildAssistantContext,
  composeUserContent,
  systemPrompt,
} from "@/lib/assistant/context";
import { completeChat, historyToMoonshot, isMoonshotConfigured } from "@/lib/assistant/moonshot";
import {
  createThread,
  getThread,
  insertMessage,
  listMessages,
  titleFromMessage,
  touchThread,
} from "@/lib/assistant/store";
import type { AssistantAttachment, AssistantSendInput } from "@/lib/assistant/types";

const SKIPPED_REPLY =
  "Assistant is not configured. Set MOONSHOT_API_KEY and try again.";

const attachmentSchema = z.object({
  name: z.string().min(1).max(200),
  size: z.number().int().nonnegative().max(20_000_000),
  type: z.string().max(200),
  text: z.string().max(20_000).optional(),
});

const sendSchema = z.object({
  threadId: z.union([z.uuid(), z.literal("")]).optional(),
  message: z.string().max(20_000),
  attachments: z.array(attachmentSchema).max(8),
});

function fail(message: string): ActionState {
  return { ok: false, message };
}

function refreshAssistant(threadId: string) {
  revalidatePath("/admin/assistant");
  revalidatePath(`/admin/assistant/${threadId}`);
}

export async function createThreadAction(): Promise<ActionState> {
  await requireAdmin();
  let thread;
  try {
    thread = await createThread("New chat");
  } catch {
    return fail("Could not start a chat. Reload and try again.");
  }
  await logAdminAction("assistant.thread.create", {
    entityType: "assistant_thread",
    entityId: thread.id,
  });
  redirect(`/admin/assistant/${thread.id}`);
}

export async function getDashboardSnapshotAction(): Promise<
  ActionState & { text?: string }
> {
  await requireAdmin();
  try {
    const text = await buildAssistantContext();
    return { ok: true, text };
  } catch (error) {
    console.error("[assistant] dashboard snapshot failed", error);
    return fail("Could not load dashboard data.");
  }
}

export async function askAssistantAction(
  input: AssistantSendInput
): Promise<ActionState> {
  await requireAdmin();

  const parsed = sendSchema.safeParse({
    threadId: input.threadId,
    message: input.message,
    attachments: input.attachments ?? [],
  });
  if (!parsed.success) return fail("Write a message or attach a file.");

  const message = parsed.data.message.trim();
  const attachments = parsed.data.attachments as AssistantAttachment[];
  if (!message && attachments.length === 0) {
    return fail("Write a message or attach a file.");
  }

  const startedFresh = !parsed.data.threadId;
  let thread = parsed.data.threadId
    ? await getThread(parsed.data.threadId)
    : null;
  if (!thread && parsed.data.threadId) return fail("Chat not found.");
  if (!thread) {
    try {
      thread = await createThread(
        titleFromMessage(message || attachments[0]?.name || "New chat")
      );
    } catch {
      return fail("Could not start a chat. Reload and try again.");
    }
  }

  const userContent = composeUserContent(message || "(attachment)", attachments);

  try {
    await insertMessage({
      threadId: thread.id,
      role: "user",
      content: userContent,
      attachments,
    });

    const nextTitle =
      thread.title === "New chat" ? titleFromMessage(message || attachments[0]?.name || "New chat") : undefined;
    await touchThread(thread.id, nextTitle);

    if (!isMoonshotConfigured()) {
      await insertMessage({
        threadId: thread.id,
        role: "assistant",
        content: SKIPPED_REPLY,
      });
      await touchThread(thread.id);
      await logAdminAction("assistant.send", {
        entityType: "assistant_thread",
        entityId: thread.id,
        details: { skipped: true },
      });
      refreshAssistant(thread.id);
      if (startedFresh) redirect(`/admin/assistant/${thread.id}`);
      return { ok: true, message: "Set MOONSHOT_API_KEY." };
    }

    const history = await listMessages(thread.id);
    const prior = history.filter((row) => row.id !== history.at(-1)?.id);
    const context = await buildAssistantContext();

    const reply = await completeChat([
      { role: "system", content: `${systemPrompt()}\n\n${context}` },
      ...historyToMoonshot(prior),
      { role: "user", content: userContent },
    ]);

    await insertMessage({
      threadId: thread.id,
      role: "assistant",
      content: reply.content,
      reasoningContent: reply.reasoningContent,
    });
    await touchThread(thread.id);
    await logAdminAction("assistant.send", {
      entityType: "assistant_thread",
      entityId: thread.id,
    });
    refreshAssistant(thread.id);
    if (startedFresh) redirect(`/admin/assistant/${thread.id}`);
    return { ok: true, message: "Reply ready." };
  } catch (error) {
    console.error("[assistant] ask failed", error);
    refreshAssistant(thread.id);
    return fail(error instanceof Error ? error.message : "Could not send.");
  }
}
