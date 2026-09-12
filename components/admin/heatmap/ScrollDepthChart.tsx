import type { ScrollDepthBin } from "@/lib/analytics/types";

export function ScrollDepthChart({ bins }: { bins: ScrollDepthBin[] }) {
  return (
    <div className="space-y-3">
      {bins.map((bin) => (
        <div key={bin.depth}>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Reached {bin.depth}%</span>
            <span>{bin.reachedPct}% of sessions</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${bin.reachedPct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
