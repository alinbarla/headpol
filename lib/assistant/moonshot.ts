import "server-only";

const MOONSHOT_URL = "https://api.moonshot.ai/v1/chat/completions";
const TIMEOUT_MS = 45_000;

export type MoonshotRole = "system" | "user" | "assistant";

export type MoonshotMessage = {
  role: MoonshotRole;
  content: string;
  reasoning_content?: string;
};

export type MoonshotReply = {
  content: string;
  reasoningContent: string | null;
};

export function isMoonshotConfigured(): boolean {
  return Boolean(process.env.MOONSHOT_API_KEY?.trim());
}

function moonshotModel(): string {
  return process.env.MOONSHOT_MODEL?.trim() || "kimi-k3";
}

function asContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return typeof part.text === "string" ? part.text : "";
        }
        return "";
      })
      .join("");
  }
  return "";
}

export async function completeChat(
  messages: MoonshotMessage[],
  options?: { thinking?: boolean }
): Promise<MoonshotReply> {
  const key = process.env.MOONSHOT_API_KEY?.trim();
  if (!key) {
    throw new Error("Assistant is not configured.");
  }

  const response = await fetch(MOONSHOT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: moonshotModel(),
      reasoning_effort: options?.thinking ? "high" : "low",
      messages,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{
      message?: { content?: unknown; reasoning_content?: unknown };
    }>;
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || "Assistant request failed.");
  }

  const message = payload.choices?.[0]?.message;
  const content = asContent(message?.content).trim();
  const reasoning =
    typeof message?.reasoning_content === "string"
      ? message.reasoning_content
      : null;

  if (!content) {
    throw new Error("Assistant returned an empty reply.");
  }

  return { content, reasoningContent: reasoning };
}

export function historyToMoonshot(
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    reasoning_content: string | null;
  }>
): MoonshotMessage[] {
  return messages.map((row) => {
    if (row.role === "assistant") {
      return {
        role: "assistant",
        content: row.content,
        ...(row.reasoning_content
          ? { reasoning_content: row.reasoning_content }
          : {}),
      };
    }
    return { role: "user", content: row.content };
  });
}
