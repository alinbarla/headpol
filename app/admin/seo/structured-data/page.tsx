import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runStructuredDataAction } from "@/app/admin/seo/actions";
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
  blocks: number;
  types: string[];
  issues: string[];
};

export default async function StructuredDataPage() {
  await requireAdmin();
  const log = await latestAuditLog("structured-data");
  const pages = (log?.summary.pages as PageRow[] | undefined) ?? [];

  return (
    <AdminShell>
      <SeoToolHeader
        title="Structured data"
        description="JSON-LD on each sitemap URL. Flags missing or invalid blocks."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runStructuredDataAction} />}
      />

      {!log ? (
        <p className="mt-6 text-sm text-muted-foreground">No results yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Blocks</TableHead>
                <TableHead>Types</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.url}>
                  <TableCell className="max-w-xs truncate text-xs">
                    {page.url}
                  </TableCell>
                  <TableCell>{page.blocks}</TableCell>
                  <TableCell className="text-xs">
                    {page.types.join(", ") || "—"}
                  </TableCell>
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
