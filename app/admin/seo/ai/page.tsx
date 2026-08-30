import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runAiOptimizationAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type AiKeyword = { keyword: string; aiSearchVolume: number | null };
type AiMention = {
  platform: string | null;
  mentions: number | null;
  aiSearchVolume: number | null;
};

export default async function AiOptimizationPage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-ai");
  const keywords = (log?.summary.keywords as AiKeyword[] | undefined) ?? [];
  const mentions = (log?.summary.mentions as AiMention[] | undefined) ?? [];

  return (
    <AdminShell>
      <SeoToolHeader
        title="AI optimization"
        description="AI search volume and Google AI Overview mention metrics. LLM Mentions coverage is US/English. Manual only — the mentions call can take over a minute."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runAiOptimizationAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : (
        <>
          <h2 className="mt-6 text-sm font-semibold">AI keyword volume</h2>
          {keywords.length === 0 ? (
            <SeoEmpty>No AI volume rows.</SeoEmpty>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>AI volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywords.map((row) => (
                    <TableRow key={row.keyword}>
                      <TableCell>{row.keyword}</TableCell>
                      <TableCell>{row.aiSearchVolume ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <h2 className="mt-8 text-sm font-semibold">LLM mentions</h2>
          {mentions.length === 0 ? (
            <SeoEmpty>No mention metrics yet.</SeoEmpty>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Mentions</TableHead>
                    <TableHead>AI volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentions.map((row, index) => (
                    <TableRow key={`${row.platform ?? "any"}-${index}`}>
                      <TableCell>{row.platform ?? "—"}</TableCell>
                      <TableCell>{row.mentions ?? "—"}</TableCell>
                      <TableCell>{row.aiSearchVolume ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
