import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { isDataForSeoConfigured } from "@/lib/seo/providers/dataforseo";
import { isPageSpeedConfigured } from "@/lib/seo/pagespeed";
import { latestAuditLogs } from "@/lib/seo/store";
import { SEO_AUDIT_TYPES } from "@/lib/seo/types";
import { formatTimestamp } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

export const dynamic = "force-dynamic";

const TOOLS = [
  {
    href: "/admin/seo/backlinks",
    type: "backlink-check" as const,
    title: "Backlinks",
    description: "New, active and lost referring pages from DataForSEO.",
  },
  {
    href: "/admin/seo/sitemap",
    type: "sitemap-check" as const,
    title: "Sitemap & robots",
    description: "Confirms sitemap.xml and robots.txt exist and reference each other.",
  },
  {
    href: "/admin/seo/meta-audit",
    type: "meta-audit" as const,
    title: "Meta tags",
    description: "Title, description and Open Graph coverage across sitemap URLs.",
  },
  {
    href: "/admin/seo/broken-links",
    type: "broken-links" as const,
    title: "Broken links",
    description: "Internal links that return 4xx or 5xx.",
  },
  {
    href: "/admin/seo/structured-data",
    type: "structured-data" as const,
    title: "Structured data",
    description: "JSON-LD blocks on each public page.",
  },
  {
    href: "/admin/seo/pagespeed",
    type: "pagespeed" as const,
    title: "PageSpeed",
    description: "LCP, CLS and INP for key pages.",
  },
] as const;

export default async function SeoOverviewPage() {
  await requireAdmin();
  const logs = await latestAuditLogs([...SEO_AUDIT_TYPES]);

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold">SEO</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cached checks. Manual runs are limited to once an hour per tool. The
        daily job is triggered from Supabase, not Vercel Cron.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {TOOLS.map((tool) => {
          const log = logs[tool.type];
          const summary = log?.summary ?? {};
          const skipped = summary.skipped === true;
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="text-sm">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {log
                      ? skipped
                        ? `Last run ${formatTimestamp(log.created_at)} · skipped`
                        : `Last run ${formatTimestamp(log.created_at)}`
                      : "Never run"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        <Card className="opacity-80">
          <CardHeader>
            <CardTitle className="text-sm">Search Console</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Not connected. Needs Google OAuth and a Search Console property.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-80">
          <CardHeader>
            <CardTitle className="text-sm">Keyword ranks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Not connected. Needs a SERP API subscription.
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        DataForSEO {isDataForSeoConfigured() ? "is configured" : "is not configured"}
        . PageSpeed {isPageSpeedConfigured() ? "is configured" : "is not configured"}
        .
      </p>
    </AdminShell>
  );
}
