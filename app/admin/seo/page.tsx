import {
  ActivityIcon,
  BotIcon,
  FileSearchIcon,
  FlaskConicalIcon,
  GaugeIcon,
  GlobeIcon,
  Link2Icon,
  ListTreeIcon,
  MapPinIcon,
  MessagesSquareIcon,
  SearchIcon,
  TagsIcon,
  UnplugIcon,
  WalletIcon,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { isDataForSeoConfigured } from "@/lib/seo/providers/dataforseo";
import { isPageSpeedConfigured } from "@/lib/seo/pagespeed";
import { listAuditHistory, latestAuditLogs } from "@/lib/seo/store";
import { SEO_AUDIT_TYPES, type SeoAuditType } from "@/lib/seo/types";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  SeoScoreboard,
  historyToSparks,
} from "@/components/admin/seo/SeoScoreboard";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolCard } from "@/components/admin/seo/SeoToolCard";
import { runAllSeoToolsAction } from "@/app/admin/seo/actions";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_TOOLS: Array<{
  href: string;
  type: SeoAuditType;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    href: "/admin/seo/sitemap",
    type: "sitemap-check",
    title: "Sitemap & robots",
    description: "Confirms sitemap.xml and robots.txt exist and reference each other.",
    icon: ListTreeIcon,
  },
  {
    href: "/admin/seo/meta-audit",
    type: "meta-audit",
    title: "Meta tags",
    description: "Title, description and Open Graph coverage across sitemap URLs.",
    icon: TagsIcon,
  },
  {
    href: "/admin/seo/broken-links",
    type: "broken-links",
    title: "Broken links",
    description: "Internal links that return 4xx or 5xx.",
    icon: UnplugIcon,
  },
  {
    href: "/admin/seo/structured-data",
    type: "structured-data",
    title: "Structured data",
    description: "JSON-LD blocks on each public page.",
    icon: FileSearchIcon,
  },
  {
    href: "/admin/seo/pagespeed",
    type: "pagespeed",
    title: "PageSpeed",
    description: "LCP, CLS and INP for key pages.",
    icon: GaugeIcon,
  },
];

const DFS_TOOLS: Array<{
  href: string;
  type: SeoAuditType;
  title: string;
  description: string;
  icon: LucideIcon;
  cadence: "Daily" | "Manual";
}> = [
  {
    href: "/admin/seo/backlinks",
    type: "backlink-check",
    title: "Backlinks",
    description: "Referring pages plus domain-level backlink totals.",
    icon: Link2Icon,
    cadence: "Daily",
  },
  {
    href: "/admin/seo/ranks",
    type: "dfs-serp",
    title: "SERP ranks",
    description: "Live Google.se positions for the Swedish keyword set.",
    icon: SearchIcon,
    cadence: "Manual",
  },
  {
    href: "/admin/seo/keywords",
    type: "dfs-keywords",
    title: "Keyword data",
    description: "Google Ads search volume and CPC for Sweden.",
    icon: ActivityIcon,
    cadence: "Daily",
  },
  {
    href: "/admin/seo/domain",
    type: "dfs-domain",
    title: "Domain analytics",
    description: "Technologies and contacts indexed for the domain.",
    icon: GlobeIcon,
    cadence: "Daily",
  },
  {
    href: "/admin/seo/labs",
    type: "dfs-labs",
    title: "Labs",
    description: "Ranked keywords, competitors and keyword ideas.",
    icon: FlaskConicalIcon,
    cadence: "Daily",
  },
  {
    href: "/admin/seo/onpage",
    type: "dfs-onpage",
    title: "OnPage",
    description: "Instant-page audit of the Swedish homepage.",
    icon: FileSearchIcon,
    cadence: "Manual",
  },
  {
    href: "/admin/seo/mentions",
    type: "dfs-content",
    title: "Content analysis",
    description: "Web citations of the brand keyword.",
    icon: MessagesSquareIcon,
    cadence: "Manual",
  },
  {
    href: "/admin/seo/ai",
    type: "dfs-ai",
    title: "AI optimization",
    description: "AI search volume and Google AI Overview mentions.",
    icon: BotIcon,
    cadence: "Manual",
  },
  {
    href: "/admin/seo/business",
    type: "dfs-business",
    title: "Business data",
    description: "Google Business listings in Stockholm.",
    icon: MapPinIcon,
    cadence: "Manual",
  },
  {
    href: "/admin/seo/billing",
    type: "dfs-billing",
    title: "Billing",
    description: "Remaining DataForSEO account balance.",
    icon: WalletIcon,
    cadence: "Daily",
  },
];

export default async function SeoOverviewPage() {
  await requireAdmin();
  const [logs, backlinkRows, labsRows] = await Promise.all([
    latestAuditLogs([...SEO_AUDIT_TYPES]),
    listAuditHistory("backlink-check", 14),
    listAuditHistory("dfs-labs", 14),
  ]);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">SEO</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live snapshot from the latest cached checks. Update data runs every
            tool. Daily tools cool down for an hour; manual tools do not.
          </p>
        </div>
        <SeoRunForm
          action={runAllSeoToolsAction}
          label="Update data"
          pendingLabel="Updating…"
        />
      </div>

      <SeoScoreboard
        logs={logs}
        backlinkHistory={historyToSparks(backlinkRows, "backlinks")}
        labsHistory={historyToSparks(labsRows, "etv")}
      />

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Site checks
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {SITE_TOOLS.map((tool) => (
          <SeoToolCard key={tool.href} {...tool} log={logs[tool.type]} />
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        DataForSEO
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {DFS_TOOLS.map((tool) => (
          <SeoToolCard key={tool.href} {...tool} log={logs[tool.type]} />
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        DataForSEO {isDataForSeoConfigured() ? "is configured" : "is not configured"}
        . PageSpeed {isPageSpeedConfigured() ? "is configured" : "is not configured"}
        . Merchant, App Data and Databases are not used. AI Chat lives in the
        DataForSEO dashboard, not here.
      </p>
    </AdminShell>
  );
}
