/**
 * Route slugs that more than one layer has to agree on. Kept dependency-free
 * so next.config.ts can import it alongside the app itself.
 */

/** Where Stripe Checkout returns a paying customer. Never indexed. */
export const CONFIRMATION_PATH = "bokningsbekraftelse";

/** Public confirmation page for a Checkout Session, relative to the site origin. */
export function confirmationPath(locale: string, sessionId: string): string {
  const lang = locale === "en" ? "en" : "sv";
  return `/${lang}/${CONFIRMATION_PATH}?session_id=${encodeURIComponent(sessionId)}`;
}
