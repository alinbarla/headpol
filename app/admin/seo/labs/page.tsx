import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty, SeoFacts } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runLabsAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type RankedRow = {
  keyword: string;
  position: number | null;
  searchVolume: number | null;
  url: string | null;
};

type CompetitorRow = {
  domain: string;
  intersections: number | null;
  avgPosition: number | null;
  organicCount: number | null;
  etv: number | null;
};

type IdeaRow = {
  keyword: string;
  searchVolume: number | null;
  competition: string | null;
  cpc: number | null;
};

export default async function LabsPage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-labs");
  const summary = (log?.summary ?? {}) as {
    organicCount?: number | null;
    etv?: number | null;
    pos1?: number | null;
    pos4to10?: number | null;
    ranked?: RankedRow[];
    competitors?: CompetitorRow[];
    ideas?: IdeaRow[];
  };

  return (
    <AdminShell>
      <SeoToolHeader
        title="Labs"
        description="Ranked keywords, SERP competitors and keyword ideas for Sweden."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runLabsAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : (
        <>
          <SeoFacts
            items={[
              { label: "Organic keywords", value: String(summary.organicCount ?? "—") },
              { label: "Est. traffic", value: String(summary.etv ?? "—") },
              { label: "Position 1", value: String(summary.pos1 ?? "—") },
              { label: "Positions 4–10", value: String(summary.pos4to10 ?? "—") },
            ]}
          />

          <h2 className="mt-8 text-sm font-semibold">Ranked keywords</h2>
          <KeywordTable
            rows={summary.ranked ?? []}
            empty="No ranked keywords in the Sweden index yet."
          />

          <h2 className="mt-8 text-sm font-semibold">Competitors</h2>
          {(summary.competitors ?? []).length === 0 ? (
            <SeoEmpty>No competitors returned.</SeoEmpty>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Shared KW</TableHead>
                    <TableHead>Avg pos</TableHead>
                    <TableHead>Organic</TableHead>
                    <TableHead>ETV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(summary.competitors ?? []).map((row) => (
                    <TableRow key={row.domain}>
                      <TableCell>{row.domain}</TableCell>
                      <TableCell>{row.intersections ?? "—"}</TableCell>
                      <TableCell>
                        {row.avgPosition != null ? row.avgPosition.toFixed(1) : "—"}
                      </TableCell>
                      <TableCell>{row.organicCount ?? "—"}</TableCell>
                      <TableCell>{row.etv ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <h2 className="mt-8 text-sm font-semibold">Keyword ideas</h2>
          <KeywordTable
            rows={(summary.ideas ?? []).map((row) => ({
              keyword: row.keyword,
              position: null,
              searchVolume: row.searchVolume,
              url: row.competition,
            }))}
            empty="No ideas returned."
            third="Comp"
          />
        </>
      )}
    </AdminShell>
  );
}

function KeywordTable({
  rows,
  empty,
  third = "URL",
}: {
  rows: RankedRow[];
  empty: string;
  third?: string;
}) {
  if (rows.length === 0) return <SeoEmpty>{empty}</SeoEmpty>;
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Pos</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>{third}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.keyword}-${row.url ?? ""}`}>
              <TableCell>{row.keyword}</TableCell>
              <TableCell>{row.position ?? "—"}</TableCell>
              <TableCell>{row.searchVolume ?? "—"}</TableCell>
              <TableCell className="max-w-xs truncate text-xs">
                {row.url ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
