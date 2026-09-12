export function HeatmapLegend() {
  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
      <span>Low</span>
      <div
        className="h-2 flex-1 max-w-48 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgb(59 130 246), rgb(34 197 94), rgb(234 179 8), rgb(239 68 68))",
        }}
      />
      <span>High</span>
    </div>
  );
}

export function HeatmapEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
