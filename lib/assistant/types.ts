export type AssistantRole = "user" | "assistant";

export type AssistantAttachment = {
  name: string;
  size: number;
  type: string;
  text?: string;
};

export type AssistantThread = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type AssistantMessage = {
  id: string;
  thread_id: string;
  role: AssistantRole;
  content: string;
  attachments: AssistantAttachment[];
  reasoning_content: string | null;
  created_at: string;
};

export type AssistantSendInput = {
  threadId?: string;
  message: string;
  attachments: AssistantAttachment[];
  thinking?: boolean;
};

export type AskAssistantResult = {
  ok: boolean;
  message?: string;
  threadId?: string;
  reply?: string;
};
