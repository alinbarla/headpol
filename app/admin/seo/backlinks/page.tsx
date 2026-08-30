import { requireAdmin } from "@/lib/admin/auth";
import { listBacklinks, latestAuditLog } from "@/lib/seo/store";
import { formatTimestamp } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoFacts } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runBacklinkCheckAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readFilter(
  params: Record<string, string | string[] | undefined>
): "all" | "new" | "lost" {
  const raw = params.filter;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "new" || value === "lost") return value;
  return "all";
}

export default async function BacklinksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const filter = readFilter(params);
  const [rows, log] = await Promise.all([
    listBacklinks(filter),
    latestAuditLog("backlink-check"),
  ]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "lost", label: "Lost" },
  ] as const;

  return (
    <AdminShell>
      <SeoToolHeader
        title="Backlinks"
        description="Referring pages from DataForSEO. New rows appear after a check; lost means they dropped out of the index."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runBacklinkCheckAction} />}
      />

      {log?.summary &&
      (log.summary.backlinks != null || log.summary.referringDomains != null) ? (
        <SeoFacts
          items={[
            { label: "Backlinks", value: String(log.summary.backlinks ?? "—") },
            {
              label: "Referring domains",
              value: String(log.summary.referringDomains ?? "—"),
            },
            {
              label: "Referring pages",
              value: String(log.summary.referringPages ?? "—"),
            },
            { label: "Rank", value: String(log.summary.rank ?? "—") },
          ]}
        />
      ) : null}

      <div className="mt-4 flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "all" ? "/admin/seo/backlinks" : `/admin/seo/backlinks?filter=${tab.id}`}
            className={`rounded-md px-3 py-1.5 text-sm ${
              filter === tab.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No backlinks in this view yet. Run a check if DataForSEO is configured.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Anchor</TableHead>
                <TableHead>DA</TableHead>
                <TableHead>Discovered</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-xs truncate">
                    <a
                      href={row.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {row.source_url}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[12rem] truncate">
                    {row.anchor_text || "—"}
                  </TableCell>
                  <TableCell>{row.domain_authority ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatTimestamp(row.discovered_at)}
                  </TableCell>
                  <TableCell>
                    {row.status === "lost"
                      ? "Lost"
                      : row.is_new
                        ? "New"
                        : "Active"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminShell>
  );
}
