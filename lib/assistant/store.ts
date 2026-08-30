import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  AssistantAttachment,
  AssistantMessage,
  AssistantRole,
  AssistantThread,
} from "./types";

const THREAD_COLUMNS = "id, title, created_at, updated_at";
const MESSAGE_COLUMNS =
  "id, thread_id, role, content, attachments, reasoning_content, created_at";

const STORE_ERROR = "Could not save chat.";

function asAttachments(value: unknown): AssistantAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.name !== "string") return [];
    return [
      {
        name: row.name,
        size: typeof row.size === "number" ? row.size : 0,
        type: typeof row.type === "string" ? row.type : "application/octet-stream",
        text: typeof row.text === "string" ? row.text : undefined,
      },
    ];
  });
}

function asThread(row: Record<string, unknown>): AssistantThread {
  return {
    id: String(row.id),
    title: typeof row.title === "string" ? row.title : "New chat",
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function asMessage(row: Record<string, unknown>): AssistantMessage {
  return {
    id: String(row.id),
    thread_id: String(row.thread_id),
    role: row.role === "assistant" ? "assistant" : "user",
    content: typeof row.content === "string" ? row.content : "",
    attachments: asAttachments(row.attachments),
    reasoning_content:
      typeof row.reasoning_content === "string" ? row.reasoning_content : null,
    created_at: String(row.created_at),
  };
}

export function titleFromMessage(message: string): string {
  const compact = message.replace(/\s+/g, " ").trim();
  if (!compact) return "New chat";
  return compact.length > 80 ? `${compact.slice(0, 77).trimEnd()}…` : compact;
}

export async function listThreads(): Promise<AssistantThread[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("assistant_threads")
      .select(THREAD_COLUMNS)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[assistant] listThreads failed", error.message);
      return [];
    }
    return (data ?? []).map((row) => asThread(row as Record<string, unknown>));
  } catch (error) {
    console.error("[assistant] listThreads failed", error);
    return [];
  }
}

export async function getThread(id: string): Promise<AssistantThread | null> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("assistant_threads")
      .select(THREAD_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[assistant] getThread failed", error.message);
      return null;
    }
    return data ? asThread(data as Record<string, unknown>) : null;
  } catch (error) {
    console.error("[assistant] getThread failed", error);
    return null;
  }
}

export async function listMessages(
  threadId: string
): Promise<AssistantMessage[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("assistant_messages")
      .select(MESSAGE_COLUMNS)
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[assistant] listMessages failed", error.message);
      return [];
    }
    return (data ?? []).map((row) => asMessage(row as Record<string, unknown>));
  } catch (error) {
    console.error("[assistant] listMessages failed", error);
    return [];
  }
}

export async function createThread(title = "New chat"): Promise<AssistantThread> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("assistant_threads")
    .insert({ title })
    .select(THREAD_COLUMNS)
    .single();

  if (error || !data) {
    console.error("[assistant] createThread failed", error?.message);
    throw new Error(STORE_ERROR);
  }
  return asThread(data as Record<string, unknown>);
}

export async function insertMessage(input: {
  threadId: string;
  role: AssistantRole;
  content: string;
  attachments?: AssistantAttachment[];
  reasoningContent?: string | null;
}): Promise<AssistantMessage> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("assistant_messages")
    .insert({
      thread_id: input.threadId,
      role: input.role,
      content: input.content,
      attachments: input.attachments ?? [],
      reasoning_content: input.reasoningContent ?? null,
    })
    .select(MESSAGE_COLUMNS)
    .single();

  if (error || !data) {
    console.error("[assistant] insertMessage failed", error?.message);
    throw new Error(STORE_ERROR);
  }
  return asMessage(data as Record<string, unknown>);
}

export async function touchThread(id: string, title?: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const patch: { updated_at: string; title?: string } = {
    updated_at: new Date().toISOString(),
  };
  if (title) patch.title = title;

  const { error } = await supabase
    .from("assistant_threads")
    .update(patch)
    .eq("id", id);

  if (error) {
    console.error("[assistant] touchThread failed", error.message);
    throw new Error(STORE_ERROR);
  }
}

export async function countRecentUserMessages(
  windowMs: number
): Promise<{ count: number; oldestAt: string | null }> {
  try {
    const since = new Date(Date.now() - windowMs).toISOString();
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("assistant_messages")
      .select("created_at")
      .eq("role", "user")
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[assistant] countRecentUserMessages failed", error.message);
      return { count: Number.MAX_SAFE_INTEGER, oldestAt: since };
    }

    const rows = data ?? [];
    return {
      count: rows.length,
      oldestAt: rows[0]?.created_at ?? null,
    };
  } catch (error) {
    console.error("[assistant] countRecentUserMessages failed", error);
    return { count: Number.MAX_SAFE_INTEGER, oldestAt: null };
  }
}
