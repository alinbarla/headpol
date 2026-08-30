import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { toolHeadline, toolStatus, type ToolStatus } from "@/lib/seo/overview";
import type { SeoAuditLogRecord, SeoAuditType } from "@/lib/seo/types";
import { formatTimestamp } from "@/lib/time";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ToolStatus, string> = {
  ok: "OK",
  issues: "Issues",
  skipped: "Skipped",
  never: "Never",
};

const STATUS_VARIANT: Record<
  ToolStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ok: "default",
  issues: "destructive",
  skipped: "secondary",
  never: "outline",
};

export function SeoToolCard({
  href,
  type,
  title,
  description,
  icon: Icon,
  cadence,
  log,
}: {
  href: string;
  type: SeoAuditType;
  title: string;
  description: string;
  icon: LucideIcon;
  cadence?: "Daily" | "Manual";
  log?: SeoAuditLogRecord;
}) {
  const status = toolStatus(log);
  const headline = toolHeadline(type, log);

  return (
    <Link
      href={href}
      className={cn(
        "group block h-full rounded-2xl border border-border bg-card p-4 transition-all",
        "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_0_1px_var(--primary)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {log
                ? `Last run ${formatTimestamp(log.created_at)}`
                : "Never run"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
          {cadence ? (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              {cadence}
            </Badge>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold tabular-nums tracking-tight">
        {headline.value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{headline.hint}</p>
      <p className="mt-3 text-sm leading-snug text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}
