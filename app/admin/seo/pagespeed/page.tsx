import { requireAdmin } from "@/lib/admin/auth";
import { isPageSpeedConfigured } from "@/lib/seo/pagespeed";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runPageSpeedAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type PageRow = {
  url: string;
  performance: number | null;
  lcp: string | null;
  cls: string | null;
  inp: string | null;
  error?: string;
};

export default async function PageSpeedPage() {
  await requireAdmin();
  const log = await latestAuditLog("pagespeed");
  const pages = (log?.summary.pages as PageRow[] | undefined) ?? [];
  const configured = isPageSpeedConfigured();

  return (
    <AdminShell>
      <SeoToolHeader
        title="PageSpeed"
        description="Mobile Lighthouse scores for a short list of key pages."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runPageSpeedAction} />}
      />

      {!configured ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Set PAGESPEED_API_KEY to run this tool. It is skipped on the daily job
          until then.
        </p>
      ) : null}

      {pages.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Perf</TableHead>
                <TableHead>LCP</TableHead>
                <TableHead>CLS</TableHead>
                <TableHead>INP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.url}>
                  <TableCell className="max-w-xs truncate text-xs">
                    {page.url}
                  </TableCell>
                  <TableCell>{page.error ?? page.performance ?? "—"}</TableCell>
                  <TableCell>{page.lcp ?? "—"}</TableCell>
                  <TableCell>{page.cls ?? "—"}</TableCell>
                  <TableCell>{page.inp ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : configured && !log ? (
        <p className="mt-6 text-sm text-muted-foreground">No results yet.</p>
      ) : null}
    </AdminShell>
  );
}
