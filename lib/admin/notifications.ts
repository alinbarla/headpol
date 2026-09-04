import "server-only";

import {
  getSupabaseAdminClient,
  withSupabaseTimeout,
} from "@/lib/supabase/server";

export type AdminNotificationKind =
  | "payment_received"
  | "payment_failed"
  | "checkout_expired"
  | "refund_succeeded"
  | "refund_failed"
  | "webhook_error";

export type AdminNotification = {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  body: string | null;
  booking_id: string | null;
  stripe_event_id: string | null;
  read_at: string | null;
  created_at: string;
};

export async function createAdminNotification(input: {
  kind: AdminNotificationKind;
  title: string;
  body?: string | null;
  bookingId?: string | null;
  stripeEventId?: string | null;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    await withSupabaseTimeout(
      supabase.from("admin_notifications").insert({
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        booking_id: input.bookingId ?? null,
        stripe_event_id: input.stripeEventId ?? null,
      })
    );
  } catch (error) {
    // Notifications must never take the webhook down.
    console.error("[admin] could not create notification", error);
  }
}

export async function listAdminNotifications(
  limit = 30
): Promise<AdminNotification[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("admin_notifications")
        .select(
          "id, kind, title, body, booking_id, stripe_event_id, read_at, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(limit)
    );
    if (error) {
      console.error("[admin] list notifications failed", error.message);
      return [];
    }
    return (data ?? []) as AdminNotification[];
  } catch {
    return [];
  }
}

export async function countUnreadAdminNotifications(): Promise<number> {
  try {
    const supabase = getSupabaseAdminClient();
    const { count, error } = await withSupabaseTimeout(
      supabase
        .from("admin_notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
    );
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function markAdminNotificationRead(
  id: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await withSupabaseTimeout(
      supabase
        .from("admin_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .is("read_at", null)
    );
    return !error;
  } catch {
    return false;
  }
}

export async function markAllAdminNotificationsRead(): Promise<number> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("admin_notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null)
        .select("id")
    );
    if (error) return 0;
    return (data ?? []).length;
  } catch {
    return 0;
  }
}
