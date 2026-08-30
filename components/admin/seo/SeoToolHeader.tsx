import Link from "next/link";
import type { ReactNode } from "react";
import { formatTimestamp } from "@/lib/time";

export function SeoToolHeader({
  title,
  description,
  lastRun,
  action,
}: {
  title: string;
  description: string;
  lastRun?: string | null;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs text-muted-foreground">
          <Link href="/admin/seo" className="hover:text-foreground">
            SEO
          </Link>
          <span className="px-1">/</span>
          {title}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Last run: {lastRun ? formatTimestamp(lastRun) : "Never"}
        </p>
      </div>
      {action}
    </div>
  );
}
