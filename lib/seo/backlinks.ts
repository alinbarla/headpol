import "server-only";

import {
  fetchBacklinkOverview,
  fetchBacklinksFromProvider,
  isDataForSeoConfigured,
} from "./providers/dataforseo";
import {
  insertAuditLog,
  insertNewBacklinks,
  listBacklinks,
  markLostBacklinks,
  refreshSeenBacklinks,
} from "./store";
import type { SeoRunResult } from "./types";

export async function runBacklinkCheck(): Promise<SeoRunResult> {
  if (!isDataForSeoConfigured()) {
    const summary = { skipped: true, reason: "DataForSEO credentials missing" };
    await insertAuditLog("backlink-check", summary);
    return { ok: true, skipped: true, reason: summary.reason, summary };
  }

  const [fetched, overview] = await Promise.all([
    fetchBacklinksFromProvider(),
    fetchBacklinkOverview().catch(() => null),
  ]);
  const existing = await listBacklinks("all");
  const existingByKey = new Map(
    existing.map((row) => [`${row.source_url}|${row.target_url}`, row])
  );
  const fetchedByKey = new Map(
    fetched.map((row) => [`${row.sourceUrl}|${row.targetUrl}`, row])
  );

  const newcomers = fetched.filter(
    (row) => !existingByKey.has(`${row.sourceUrl}|${row.targetUrl}`)
  );
  const seenAgain = existing.filter((row) =>
    fetchedByKey.has(`${row.source_url}|${row.target_url}`)
  );
  const lost = existing.filter(
    (row) =>
      row.status === "active" &&
      !fetchedByKey.has(`${row.source_url}|${row.target_url}`)
  );

  await insertNewBacklinks(newcomers);
  await refreshSeenBacklinks(seenAgain, fetchedByKey);
  const lostCount = await markLostBacklinks(lost.map((row) => row.id));

  const summary = {
    newCount: newcomers.length,
    lostCount,
    refreshed: seenAgain.length,
    total: fetched.length,
    ...(overview ?? {}),
  };
  await insertAuditLog("backlink-check", summary);
  return { ok: true, summary };
}
