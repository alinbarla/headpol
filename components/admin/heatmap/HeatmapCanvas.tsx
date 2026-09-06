"use client";

import { useEffect, useRef } from "react";
import { GRID_SIZE_PX } from "@/lib/analytics/constants";
import { heatColor } from "@/lib/analytics/aggregate";
import type { GridCell } from "@/lib/analytics/types";

export function HeatmapCanvas({
  cells,
  maxCount,
  sourceWidth,
  sourceHeight,
  width,
  height,
}: {
  cells: GridCell[];
  maxCount: number;
  sourceWidth: number;
  sourceHeight: number;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (maxCount <= 0 || sourceWidth <= 0 || sourceHeight <= 0) return;

    const scaleX = width / sourceWidth;
    const scaleY = height / sourceHeight;

    for (const cell of cells) {
      const t = cell.count / maxCount;
      ctx.fillStyle = heatColor(t);
      ctx.fillRect(
        cell.gx * GRID_SIZE_PX * scaleX,
        cell.gy * GRID_SIZE_PX * scaleY,
        GRID_SIZE_PX * scaleX,
        GRID_SIZE_PX * scaleY
      );
    }
  }, [cells, maxCount, sourceWidth, sourceHeight, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
