import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runMetaAuditAction } from "@/app/admin/seo/actions";
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
  titleLength: number;
  descriptionLength: number;
  issues: string[];
};

export default async function MetaAuditPage() {
  await requireAdmin();
  const log = await latestAuditLog("meta-audit");
  const pages = ((log?.summary.pages as PageRow[] | undefined) ?? []).slice(
    0,
    200
  );

  return (
    <AdminShell>
      <SeoToolHeader
        title="Meta tags"
        description="Title, description and Open Graph tags on every sitemap URL."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runMetaAuditAction} />}
      />

      {!log ? (
        <p className="mt-6 text-sm text-muted-foreground">No results yet.</p>
      ) : pages.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No pages stored.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Desc</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.url}>
                  <TableCell className="max-w-xs truncate text-xs">
                    {page.url}
                  </TableCell>
                  <TableCell>{page.titleLength}</TableCell>
                  <TableCell>{page.descriptionLength}</TableCell>
                  <TableCell className="text-xs text-amber-200">
                    {page.issues.join("; ") || "—"}
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
