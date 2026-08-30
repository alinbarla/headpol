import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runBrokenLinksAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type Broken = { page: string; href: string; status: number };

export default async function BrokenLinksPage() {
  await requireAdmin();
  const log = await latestAuditLog("broken-links");
  const broken = (log?.summary.broken as Broken[] | undefined) ?? [];
  const checked = Number(log?.summary.checked ?? 0);

  return (
    <AdminShell>
      <SeoToolHeader
        title="Broken links"
        description="Internal links found on sitemap pages that return 4xx or 5xx."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runBrokenLinksAction} />}
      />

      {log ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Checked {checked} internal URLs · {broken.length} broken
        </p>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">No results yet.</p>
      )}

      {broken.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Found on</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broken.map((row) => (
                <TableRow key={`${row.page}|${row.href}`}>
                  <TableCell>{row.status || "fail"}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs">
                    {row.href}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {row.page}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </AdminShell>
  );
}
