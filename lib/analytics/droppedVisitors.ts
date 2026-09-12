import "server-only";

import type { DroppedVisitor } from "@/lib/analytics/types";
import { getSupabaseAdminClient, withSupabaseTimeout } from "@/lib/supabase/server";

export type { DroppedVisitor };

type FormContact = {
  sessionId: string;
  visitorId: string | null;
  page: string | null;
  lastSeenAt: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
};

const FIELD_ALIASES: Record<string, keyof Pick<FormContact, "name" | "email" | "phone" | "address" | "postalCode">> =
  {
    name: "name",
    email: "email",
    phone: "phone",
    tel: "phone",
    address: "address",
    "postal-code": "postalCode",
    postalcode: "postalCode",
    postal_code: "postalCode",
  };

const PAGE_SIZE = 1000;

export function emailKey(value: string): string {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

export function phoneKey(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return "";
  return digits.slice(-9);
}

function emptyContact(sessionId: string): FormContact {
  return {
    sessionId,
    visitorId: null,
    page: null,
    lastSeenAt: new Date(0).toISOString(),
    name: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
  };
}

function applyField(contact: FormContact, field: string, value: string, ts: string) {
  const key = FIELD_ALIASES[field.trim().toLowerCase()];
  if (!key) return;
  const next = value.trim();
  if (!next) return;
  contact[key] = next;
  if (ts > contact.lastSeenAt) contact.lastSeenAt = ts;
}

async function loadFormContacts(sessionId?: string): Promise<FormContact[]> {
  const supabase = getSupabaseAdminClient();
  const bySession = new Map<string, FormContact>();

  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from("analytics_events")
      .select("session_id, field, value, ts, page")
      .eq("type", "input")
      .order("ts", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await withSupabaseTimeout(query, 8000);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Array<{
      session_id: string;
      field: string | null;
      value: string | null;
      ts: string;
      page: string | null;
    }>;

    for (const row of rows) {
      const contact = bySession.get(row.session_id) ?? emptyContact(row.session_id);
      contact.page = row.page ?? contact.page;
      if (row.field && row.value) applyField(contact, row.field, row.value, row.ts);
      bySession.set(row.session_id, contact);
    }

    if (rows.length < PAGE_SIZE) break;
  }

  const sessionIds = [...bySession.keys()];
  if (sessionIds.length === 0) return [];

  for (let i = 0; i < sessionIds.length; i += 100) {
    const chunk = sessionIds.slice(i, i + 100);
    const { data: sessions } = await withSupabaseTimeout(
      supabase
        .from("analytics_sessions")
        .select("id, visitor_id, ended_at")
        .in("id", chunk)
    );

    for (const session of (sessions ?? []) as Array<{
      id: string;
      visitor_id: string;
      ended_at: string;
    }>) {
      const contact = bySession.get(session.id);
      if (!contact) continue;
      contact.visitorId = session.visitor_id;
      if (session.ended_at > contact.lastSeenAt) contact.lastSeenAt = session.ended_at;
    }
  }

  return [...bySession.values()].filter((contact) => emailKey(contact.email));
}

async function loadBookingKeys(): Promise<{ emails: Set<string>; phones: Set<string> }> {
  const supabase = getSupabaseAdminClient();
  const emails = new Set<string>();
  const phones = new Set<string>();

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("bookings")
        .select("customer_email, customer_phone")
        .range(from, from + PAGE_SIZE - 1),
      8000
    );
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Array<{
      customer_email: string | null;
      customer_phone: string | null;
    }>;

    for (const row of rows) {
      const email = emailKey(row.customer_email ?? "");
      if (email) emails.add(email);
      const phone = phoneKey(row.customer_phone ?? "");
      if (phone) phones.add(phone);
    }

    if (rows.length < PAGE_SIZE) break;
  }

  return { emails, phones };
}

function converted(contact: FormContact, keys: { emails: Set<string>; phones: Set<string> }) {
  const email = emailKey(contact.email);
  if (email && keys.emails.has(email)) return true;
  const phone = phoneKey(contact.phone);
  if (phone && keys.phones.has(phone)) return true;
  return false;
}

export async function syncDroppedVisitors(sessionId?: string): Promise<{
  added: number;
  removed: number;
}> {
  const contacts = await loadFormContacts(sessionId);
  const keys = await loadBookingKeys();
  const supabase = getSupabaseAdminClient();

  const leads = new Map<string, FormContact>();
  for (const contact of contacts) {
    if (converted(contact, keys)) continue;
    const key = emailKey(contact.email);
    const existing = leads.get(key);
    if (!existing || contact.lastSeenAt > existing.lastSeenAt) {
      leads.set(key, contact);
    }
  }

  const { data: current } = await withSupabaseTimeout(
    supabase.from("dropped_visitors").select("id, email_key, phone, dismissed_at")
  );
  const existingRows = (current ?? []) as Array<{
    id: string;
    email_key: string;
    phone: string | null;
    dismissed_at: string | null;
  }>;
  const dismissed = new Set(
    existingRows.filter((row) => row.dismissed_at).map((row) => row.email_key)
  );

  const rows = [...leads.entries()]
    .filter(([key]) => !dismissed.has(key))
    .map(([key, contact]) => ({
      email: contact.email.trim(),
      email_key: key,
      name: contact.name || null,
      phone: contact.phone || null,
      address: contact.address || null,
      postal_code: contact.postalCode || null,
      session_id: contact.sessionId,
      visitor_id: contact.visitorId,
      page: contact.page,
      last_seen_at: contact.lastSeenAt,
    }));

  let added = 0;
  if (rows.length > 0) {
    const { error } = await withSupabaseTimeout(
      supabase.from("dropped_visitors").upsert(rows, { onConflict: "email_key" }),
      8000
    );
    if (error) throw new Error(error.message);
    added = rows.length;
  }

  const convertedIds = existingRows
    .filter((row) => {
      if (keys.emails.has(row.email_key)) return true;
      const phone = phoneKey(row.phone ?? "");
      return Boolean(phone && keys.phones.has(phone));
    })
    .map((row) => row.id);

  let removed = 0;
  if (convertedIds.length > 0) {
    const { error } = await withSupabaseTimeout(
      supabase.from("dropped_visitors").delete().in("id", convertedIds)
    );
    if (error) throw new Error(error.message);
    removed = convertedIds.length;
  }

  return { added, removed };
}

export async function removeConvertedDroppedVisitor(email?: string | null, phone?: string | null) {
  const supabase = getSupabaseAdminClient();
  const key = emailKey(email ?? "");
  const phoneDigits = phoneKey(phone ?? "");

  if (key) {
    await withSupabaseTimeout(
      supabase.from("dropped_visitors").delete().eq("email_key", key)
    );
  }

  if (phoneDigits) {
    const { data } = await withSupabaseTimeout(
      supabase.from("dropped_visitors").select("id, phone")
    );
    const ids = ((data ?? []) as Array<{ id: string; phone: string | null }>)
      .filter((row) => phoneKey(row.phone ?? "") === phoneDigits)
      .map((row) => row.id);
    if (ids.length > 0) {
      await withSupabaseTimeout(supabase.from("dropped_visitors").delete().in("id", ids));
    }
  }
}

export async function listDroppedVisitors(): Promise<DroppedVisitor[]> {
  await syncDroppedVisitors();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("dropped_visitors")
      .select(
        "id, email, name, phone, address, postal_code, session_id, visitor_id, page, last_seen_at, created_at, dismissed_at"
      )
      .is("dismissed_at", null)
      .order("last_seen_at", { ascending: false })
      .limit(500)
  );
  if (error) throw new Error(error.message);
  return (data ?? []) as DroppedVisitor[];
}

export async function dismissDroppedVisitors(ids: string[]): Promise<number> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (unique.length === 0) return 0;
  const supabase = getSupabaseAdminClient();
  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("dropped_visitors")
      .update({ dismissed_at: new Date().toISOString() })
      .in("id", unique)
      .select("id")
  );
  if (error) throw new Error(error.message);
  return (data ?? []).length;
}
