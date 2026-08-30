import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty, SeoFacts } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runOnPageAction } from "@/app/admin/seo/actions";

export const dynamic = "force-dynamic";

export default async function OnPageSeoPage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-onpage");
  const summary = (log?.summary ?? {}) as {
    url?: string;
    score?: number | null;
    title?: string | null;
    description?: string | null;
    issues?: string[];
  };

  return (
    <AdminShell>
      <SeoToolHeader
        title="OnPage"
        description="DataForSEO instant-page audit of the Swedish homepage. Manual only."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runOnPageAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : (
        <>
          <SeoFacts
            items={[
              {
                label: "OnPage score",
                value: summary.score != null ? String(summary.score) : "—",
              },
              { label: "URL", value: summary.url ?? "—" },
              { label: "Title", value: summary.title ?? "—" },
              { label: "Description", value: summary.description ?? "—" },
            ]}
          />
          {summary.issues && summary.issues.length > 0 ? (
            <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-amber-200">
              {summary.issues.map((issue) => (
                <li key={issue}>{issue.replaceAll("_", " ")}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-emerald-200">
              No flagged OnPage issues.
            </p>
          )}
        </>
      )}
    </AdminShell>
  );
}
