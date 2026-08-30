import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runContentMentionsAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type MentionRow = {
  url: string | null;
  domain: string | null;
  title: string | null;
  snippet: string | null;
};

export default async function ContentMentionsPage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-content");
  const items = (log?.summary.items as MentionRow[] | undefined) ?? [];
  const total = log?.summary.total;

  return (
    <AdminShell>
      <SeoToolHeader
        title="Content mentions"
        description="Citations of “strålkastarpolering” from the Content Analysis index. Manual only."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runContentMentionsAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : items.length === 0 ? (
        <SeoEmpty>
          {typeof total === "number"
            ? `Index reported ${total} mentions, but no rows were returned.`
            : "No citations stored."}
        </SeoEmpty>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row, index) => (
                <TableRow key={`${row.url ?? row.domain ?? index}`}>
                  <TableCell>{row.domain ?? "—"}</TableCell>
                  <TableCell className="max-w-sm truncate">
                    {row.title ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs">
                    {row.url ? (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {row.url}
                      </a>
                    ) : (
                      "—"
                    )}
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
