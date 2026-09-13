"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { downloadCsv, type CsvRow } from "@/lib/admin/csv";

export function CsvDownloadButton({
  filename,
  rows,
  label = "Download CSV",
}: {
  filename: string;
  rows: CsvRow[];
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={rows.length === 0}
      onClick={() => downloadCsv(filename, rows)}
    >
      <DownloadIcon />
      {label}
    </Button>
  );
}
