import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runSitemapCheckAction } from "@/app/admin/seo/actions";

export const dynamic = "force-dynamic";

export default async function SitemapSeoPage() {
  await requireAdmin();
  const log = await latestAuditLog("sitemap-check");
  const summary = (log?.summary ?? {}) as {
    sitemapStatus?: number;
    robotsStatus?: number;
    urlCount?: number;
    robotsSitemapUrl?: string | null;
    issues?: string[];
  };

  return (
    <AdminShell>
      <SeoToolHeader
        title="Sitemap & robots"
        description="Fetches /sitemap.xml and /robots.txt from the public origin and checks they reference each other."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runSitemapCheckAction} />}
      />

      {!log ? (
        <p className="mt-6 text-sm text-muted-foreground">No results yet.</p>
      ) : (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <Fact label="sitemap.xml" value={String(summary.sitemapStatus ?? "—")} />
          <Fact label="robots.txt" value={String(summary.robotsStatus ?? "—")} />
          <Fact label="URLs in sitemap" value={String(summary.urlCount ?? "—")} />
          <Fact
            label="robots Sitemap"
            value={summary.robotsSitemapUrl ?? "—"}
          />
        </dl>
      )}

      {summary.issues && summary.issues.length > 0 ? (
        <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-amber-200">
          {summary.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : log ? (
        <p className="mt-6 text-sm text-emerald-200">No issues found.</p>
      ) : null}
    </AdminShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all text-sm font-medium">{value}</dd>
    </div>
  );
}
