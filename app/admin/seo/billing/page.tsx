import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty, SeoFacts } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runBillingAction } from "@/app/admin/seo/actions";

export const dynamic = "force-dynamic";

function money(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `$${value.toFixed(2)}`;
}

export default async function DataForSeoBillingPage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-billing");
  const summary = (log?.summary ?? {}) as {
    balance?: number | null;
    total?: number | null;
  };

  return (
    <AdminShell>
      <SeoToolHeader
        title="DataForSEO billing"
        description="Account balance from /v3/appendix/user_data. This call is included in the daily job."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runBillingAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : (
        <SeoFacts
          items={[
            { label: "Balance", value: money(summary.balance) },
            { label: "Lifetime deposited", value: money(summary.total) },
          ]}
        />
      )}
    </AdminShell>
  );
}
