import type { BarRow, SparkPoint } from "@/lib/seo/overview";

export function SeoBarList({
  title,
  empty,
  rows,
  invert = false,
  maxHint,
}: {
  title: string;
  empty: string;
  rows: BarRow[];
  invert?: boolean;
  maxHint?: number;
}) {
  const rawMax = Math.max(...rows.map((row) => row.value), 1);
  const max = maxHint && maxHint > rawMax ? maxHint : rawMax;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {rows.map((row) => {
            const fill = invert
              ? Math.max(6, ((max - row.value + 1) / max) * 100)
              : (row.value / max) * 100;
            return (
              <li key={row.label}>
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-foreground">
                    {new Intl.NumberFormat("sv-SE").format(row.value)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, fill)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SeoSparkline({
  title,
  empty,
  points,
}: {
  title: string;
  empty: string;
  points: SparkPoint[];
}) {
  const values = points.map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = max - min || 1;
  const width = 320;
  const height = 72;
  const pad = 4;

  const d = points
    .map((point, index) => {
      const x =
        points.length === 1
          ? width / 2
          : pad + (index / (points.length - 1)) * (width - pad * 2);
      const y =
        height - pad - ((point.value - min) / span) * (height - pad * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {points.length > 0 ? (
          <p className="text-xs tabular-nums text-muted-foreground">
            {new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(
              points[points.length - 1]?.value ?? 0
            )}
          </p>
        ) : null}
      </div>
      {points.length < 2 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-3 h-20 w-full"
          role="img"
          aria-label={title}
        >
          <path
            d={d}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
