import { requireAdmin } from "@/lib/admin/auth";
import { latestAuditLog } from "@/lib/seo/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeoEmpty } from "@/components/admin/seo/SeoFacts";
import { SeoRunForm } from "@/components/admin/seo/SeoRunForm";
import { SeoToolHeader } from "@/components/admin/seo/SeoToolHeader";
import { runBusinessDataAction } from "@/app/admin/seo/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type Listing = {
  title: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  url: string | null;
  rating: number | null;
  reviews: number | null;
};

export default async function BusinessDataPage() {
  await requireAdmin();
  const log = await latestAuditLog("dfs-business");
  const listings = (log?.summary.listings as Listing[] | undefined) ?? [];

  return (
    <AdminShell>
      <SeoToolHeader
        title="Business data"
        description="Google Business listings matching “Strålkastarpolering” in Stockholm. Manual only."
        lastRun={log?.created_at}
        action={<SeoRunForm action={runBusinessDataAction} />}
      />

      {!log ? (
        <SeoEmpty>No results yet.</SeoEmpty>
      ) : listings.length === 0 ? (
        <SeoEmpty>No listings returned for that search.</SeoEmpty>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((row, index) => (
                <TableRow key={`${row.title ?? "listing"}-${index}`}>
                  <TableCell>
                    <div>{row.title ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.category ?? ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.rating != null
                      ? `${row.rating}${row.reviews != null ? ` (${row.reviews})` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs text-xs">
                    {row.address ?? "—"}
                  </TableCell>
                  <TableCell>{row.phone ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminShell>
  );
}
