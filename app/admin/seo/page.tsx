import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { isDataForSeoConfigured } from "@/lib/seo/providers/dataforseo";
import { isPageSpeedConfigured } from "@/lib/seo/pagespeed";
import { latestAuditLogs } from "@/lib/seo/store";
import { SEO_AUDIT_TYPES, type SeoAuditType } from "@/lib/seo/types";
import { formatTimestamp } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

export const dynamic = "force-dynamic";

const SITE_TOOLS = [
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

const DFS_TOOLS = [
  {
    href: "/admin/seo/backlinks",
    type: "backlink-check" as const,
    title: "Backlinks",
    description: "Referring pages plus domain-level backlink totals.",
    daily: true,
  },
  {
    href: "/admin/seo/ranks",
    type: "dfs-serp" as const,
    title: "SERP ranks",
    description: "Live Google.se positions for the Swedish keyword set.",
    daily: false,
  },
  {
    href: "/admin/seo/keywords",
    type: "dfs-keywords" as const,
    title: "Keyword data",
    description: "Google Ads search volume and CPC for Sweden.",
    daily: true,
  },
  {
    href: "/admin/seo/domain",
    type: "dfs-domain" as const,
    title: "Domain analytics",
    description: "Technologies and contacts indexed for the domain.",
    daily: true,
  },
  {
    href: "/admin/seo/labs",
    type: "dfs-labs" as const,
    title: "Labs",
    description: "Ranked keywords, competitors and keyword ideas.",
    daily: true,
  },
  {
    href: "/admin/seo/onpage",
    type: "dfs-onpage" as const,
    title: "OnPage",
    description: "Instant-page audit of the Swedish homepage.",
    daily: false,
  },
  {
    href: "/admin/seo/mentions",
    type: "dfs-content" as const,
    title: "Content analysis",
    description: "Web citations of the brand keyword.",
    daily: false,
  },
  {
    href: "/admin/seo/ai",
    type: "dfs-ai" as const,
    title: "AI optimization",
    description: "AI search volume and Google AI Overview mentions.",
    daily: false,
  },
  {
    href: "/admin/seo/business",
    type: "dfs-business" as const,
    title: "Business data",
    description: "Google Business listings in Stockholm.",
    daily: false,
  },
  {
    href: "/admin/seo/billing",
    type: "dfs-billing" as const,
    title: "Billing",
    description: "Remaining DataForSEO account balance.",
    daily: true,
  },
] as const;

export default async function SeoOverviewPage() {
  await requireAdmin();
  const logs = await latestAuditLogs([...SEO_AUDIT_TYPES]);
  const balance = logs["dfs-billing"]?.summary.balance;

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold">SEO</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cached checks. Manual runs are limited to once an hour per tool. The
        daily job is triggered from Supabase and skips expensive live SERP, OnPage,
        mentions and AI calls.
      </p>

      <h2 className="mt-8 text-sm font-semibold">Site checks</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {SITE_TOOLS.map((tool) => (
          <ToolCard key={tool.href} tool={tool} log={logs[tool.type]} />
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold">DataForSEO</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Same login as the API credentials page
        {typeof balance === "number"
          ? ` · last balance $${balance.toFixed(2)}`
          : ""}
        .
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {DFS_TOOLS.map((tool) => (
          <ToolCard
            key={tool.href}
            tool={tool}
            log={logs[tool.type]}
            badge={tool.daily ? "Daily" : "Manual"}
          />
        ))}

        <Card className="opacity-80">
          <CardHeader>
            <CardTitle className="text-sm">Not used here</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Merchant, App Data and Databases do not apply to this site. AI Chat
              is DataForSEO’s dashboard assistant, not an API we call.
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

function ToolCard({
  tool,
  log,
  badge,
}: {
  tool: {
    href: string;
    type: SeoAuditType;
    title: string;
    description: string;
  };
  log?: { created_at: string; summary: Record<string, unknown> };
  badge?: string;
}) {
  const skipped = log?.summary.skipped === true;
  return (
    <Link href={tool.href}>
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-sm">
            {tool.title}
            {badge ? (
              <span className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                {badge}
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
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
}
