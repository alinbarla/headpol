import "server-only";

import { countRecentUserMessages } from "./store";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_USER_MESSAGES = 20;

export async function assistantCooldown(): Promise<{
  allowed: boolean;
  retryAfterMinutes: number;
}> {
  const { count, oldestAt } = await countRecentUserMessages(WINDOW_MS);
  if (count < MAX_USER_MESSAGES) {
    return { allowed: true, retryAfterMinutes: 0 };
  }

  if (!oldestAt) {
    return { allowed: false, retryAfterMinutes: 10 };
  }

  const elapsed = Date.now() - new Date(oldestAt).getTime();
  const remaining = WINDOW_MS - elapsed;
  return {
    allowed: false,
    retryAfterMinutes: Math.max(1, Math.ceil(remaining / 60_000)),
  };
}
