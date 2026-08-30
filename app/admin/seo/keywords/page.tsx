import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runKeywordVolumeAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type VolumeRow = {
  keyword: string;
  searchVolume: number | null;
  competition: string | null;
  cpc: number | null;
};

export default async function KeywordVolumePage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-keywords");
  const keywords = (log?.summary.keywords as VolumeRow[] | undefined) ?? [];

  return (
    <AdminShell>
      <SeoToolHeader
        title="Keyword data"
        description="Google Ads search volume, competition and CPC for Sweden (sv)."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runKeywordVolumeAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>CPC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((row) => (
                <TableRow key={row.keyword}>
                  <TableCell>{row.keyword}</TableCell>
                  <TableCell>{row.searchVolume ?? "—"}</TableCell>
                  <TableCell>{row.competition ?? "—"}</TableCell>
                  <TableCell>
                    {row.cpc != null ? `$${row.cpc.toFixed(2)}` : "—"}
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
