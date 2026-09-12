import { GRID_SIZE_PX } from "@/lib/analytics/constants";
import type { GridCell, HeatmapGrid } from "@/lib/analytics/types";

export function cellKey(gx: number, gy: number): string {
  return `${gx}:${gy}`;
}

export function toGridCell(x: number, y: number): { gx: number; gy: number } {
  return {
    gx: Math.floor(x / GRID_SIZE_PX),
    gy: Math.floor(y / GRID_SIZE_PX),
  };
}

export function buildHeatmapGrid(
  rows: Array<{
    x: number | null;
    y: number | null;
    dwell_ms: number | null;
    document_h: number;
    viewport_w: number;
  }>,
  weightByDwell = false
): HeatmapGrid {
  const buckets = new Map<string, GridCell>();
  let maxCount = 0;
  let documentH = 0;
  let viewportW = 0;

  for (const row of rows) {
    if (row.x == null || row.y == null) continue;
    if (row.x < 0 || row.y < 0) continue;

    const { gx, gy } = toGridCell(row.x, row.y);
    const key = cellKey(gx, gy);
    const weight = weightByDwell ? Math.max(1, row.dwell_ms ?? 1) : 1;
    const current = buckets.get(key) ?? { gx, gy, count: 0 };
    current.count += weight;
    buckets.set(key, current);
    maxCount = Math.max(maxCount, current.count);
    documentH = Math.max(documentH, row.document_h);
    viewportW = Math.max(viewportW, row.viewport_w);
  }

  return {
    cells: [...buckets.values()],
    maxCount,
    documentH,
    viewportW,
    eventCount: rows.length,
  };
}

/** Blue → green → yellow → red. */
export function heatColor(t: number, alpha = 0.55): string {
  const clamped = Math.min(1, Math.max(0, t));
  const stops: Array<[number, number, number]> = [
    [59, 130, 246],
    [34, 197, 94],
    [234, 179, 8],
    [239, 68, 68],
  ];

  const scaled = clamped * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const from = stops[index];
  const to = stops[index + 1];
  const r = Math.round(from[0] + (to[0] - from[0]) * local);
  const g = Math.round(from[1] + (to[1] - from[1]) * local);
  const b = Math.round(from[2] + (to[2] - from[2]) * local);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
