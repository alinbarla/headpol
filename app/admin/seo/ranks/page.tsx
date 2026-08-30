import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runSerpRanksAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type RankRow = {
  keyword: string;
  position: number | null;
  url: string | null;
  title: string | null;
};

export default async function SerpRanksPage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-serp");
  const ranks = (log?.summary.ranks as RankRow[] | undefined) ?? [];

  return (
    <AdminShell>
      <SeoToolHeader
        title="SERP ranks"
        description="Live Google.se desktop results for the Swedish keyword set. Manual only — each keyword is a paid live SERP call."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runSerpRanksAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : ranks.length === 0 ? (
        <SeoEmpty>No keywords stored.</SeoEmpty>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranks.map((row) => (
                <TableRow key={row.keyword}>
                  <TableCell>{row.keyword}</TableCell>
                  <TableCell>{row.position ?? "Not in top 10"}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs">
                    {row.url ?? "—"}
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
