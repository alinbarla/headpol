import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty, SeoFacts } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runDomainAnalyticsAction } from "@/app/admin/seo/actions";

export const dynamic = "force-dynamic";

export default async function DomainAnalyticsPage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-domain");
  const summary = (log?.summary ?? {}) as {
    title?: string | null;
    description?: string | null;
    domainRank?: string | null;
    country?: string | null;
    language?: string | null;
    emails?: string[];
    phones?: string[];
    technologies?: string[];
  };

  return (
    <AdminShell>
      <SeoToolHeader
        title="Domain analytics"
        description="Technologies, contacts and rank DataForSEO has indexed for stralkastarpolering.se."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runDomainAnalyticsAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : (
        <>
          <SeoFacts
            items={[
              { label: "Title", value: summary.title ?? "—" },
              { label: "Domain rank", value: summary.domainRank ?? "—" },
              { label: "Country", value: summary.country ?? "—" },
              { label: "Language", value: summary.language ?? "—" },
              { label: "Emails", value: summary.emails?.join(", ") || "—" },
              { label: "Phones", value: summary.phones?.join(", ") || "—" },
            ]}
          />
          {summary.description ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {summary.description}
            </p>
          ) : null}
          {summary.technologies && summary.technologies.length > 0 ? (
            <ul className="mt-6 columns-1 gap-x-6 text-sm sm:columns-2">
              {summary.technologies.map((tech) => (
                <li key={tech} className="break-inside-avoid py-0.5">
                  {tech}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
