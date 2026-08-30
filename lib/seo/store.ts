import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  BacklinkRecord,
  FetchedBacklink,
  SeoAuditLogRecord,
  SeoAuditType,
} from "./types";

export async function listBacklinks(
  filter: "all" | "new" | "lost" = "all"
): Promise<BacklinkRecord[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("backlinks")
    .select(
      "id, source_url, target_url, anchor_text, domain_authority, discovered_at, last_seen_at, status, is_new"
    )
    .order("discovered_at", { ascending: false });

  if (filter === "new") query = query.eq("is_new", true).eq("status", "active");
  if (filter === "lost") query = query.eq("status", "lost");

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as BacklinkRecord[];
}

export async function insertNewBacklinks(
  rows: FetchedBacklink[]
): Promise<number> {
  if (rows.length === 0) return 0;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("backlinks").insert(
    rows.map((item) => ({
      source_url: item.sourceUrl,
      target_url: item.targetUrl,
      anchor_text: item.anchorText,
      domain_authority: item.domainAuthority,
      status: "active",
      is_new: true,
    }))
  );
  if (error) throw new Error(error.message);
  return rows.length;
}

export async function refreshSeenBacklinks(
  rows: BacklinkRecord[],
  fetchedByKey: Map<string, FetchedBacklink>
): Promise<void> {
  if (rows.length === 0) return;
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  await Promise.all(
    rows.map((row) => {
      const fetched = fetchedByKey.get(`${row.source_url}|${row.target_url}`);
      return supabase
        .from("backlinks")
        .update({
          last_seen_at: now,
          status: "active",
          is_new: false,
          anchor_text: fetched?.anchorText ?? row.anchor_text,
          domain_authority: fetched?.domainAuthority ?? row.domain_authority,
        })
        .eq("id", row.id);
    })
  );
}

export async function markLostBacklinks(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("backlinks")
    .update({ status: "lost", is_new: false })
    .in("id", ids);
  if (error) throw new Error(error.message);
  return ids.length;
}

export async function insertAuditLog(
  type: SeoAuditType,
  summary: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("seo_audit_logs").insert({
    type,
    summary,
  });
  if (error) throw new Error(error.message);
}

export async function latestAuditLog(
  type: SeoAuditType
): Promise<SeoAuditLogRecord | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("seo_audit_logs")
    .select("id, type, summary, created_at")
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as SeoAuditLogRecord | null) ?? null;
}

export async function latestAuditLogs(
  types: SeoAuditType[]
): Promise<Partial<Record<SeoAuditType, SeoAuditLogRecord>>> {
  const rows = await Promise.all(types.map((type) => latestAuditLog(type)));
  const map: Partial<Record<SeoAuditType, SeoAuditLogRecord>> = {};
  types.forEach((type, index) => {
    const row = rows[index];
    if (row) map[type] = row;
  });
  return map;
}

/** Oldest-first slice for sparklines. Skipped runs are left in so gaps stay visible. */
export async function listAuditHistory(
  type: SeoAuditType,
  limit = 14
): Promise<SeoAuditLogRecord[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("seo_audit_logs")
    .select("id, type, summary, created_at")
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return ((data ?? []) as SeoAuditLogRecord[]).slice().reverse();
}
