import type { ScrollDepthBin } from "@/lib/analytics/types";

const DEPTHS = [25, 50, 75, 100] as const;

export function buildScrollDepth(
  sessions: Array<{ max_scroll_pct: number }>
): ScrollDepthBin[] {
  const total = sessions.length;
  if (total === 0) {
    return DEPTHS.map((depth) => ({ depth, reachedPct: 0 }));
  }

  return DEPTHS.map((depth) => {
    const reached = sessions.filter((session) => Number(session.max_scroll_pct) >= depth)
      .length;
    return {
      depth,
      reachedPct: Math.round((reached / total) * 100),
    };
  });
}
