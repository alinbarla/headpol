export const ASSISTANT_CONTEXT_KINDS = [
  "seo",
  "payments",
  "bookings",
  "calendar",
  "github",
] as const;

export type AssistantContextKind = (typeof ASSISTANT_CONTEXT_KINDS)[number];

export const ASSISTANT_CONTEXT_LABELS: Record<AssistantContextKind, string> = {
  seo: "SEO",
  payments: "Payments",
  bookings: "Bookings",
  calendar: "Calendar",
  github: "Latest app source",
};

export function isAssistantContextKind(
  value: string
): value is AssistantContextKind {
  return (ASSISTANT_CONTEXT_KINDS as readonly string[]).includes(value);
}
