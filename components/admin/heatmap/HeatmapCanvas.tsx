"use client";

import { useEffect, useRef } from "react";
import { GRID_SIZE_PX } from "@/lib/analytics/constants";
import { heatColor } from "@/lib/analytics/aggregate";
import type { GridCell } from "@/lib/analytics/types";

/** iOS Safari OOMs around ~16MP canvases; stay well under that. */
const MAX_CANVAS_PIXELS = 4_000_000;
const MAX_DPR = 2;

export function HeatmapCanvas({
  cells,
  maxCount,
  sourceWidth,
  sourceHeight,
  width,
  height,
  offsetY = 0,
}: {
  cells: GridCell[];
  maxCount: number;
  sourceWidth: number;
  sourceHeight: number;
  /** Visible CSS width of the overlay (viewport). */
  width: number;
  /** Visible CSS height of the overlay (viewport). */
  height: number;
  /** How far the full-page overlay has been translated up (CSS px). */
  offsetY?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cssW = Math.max(1, Math.round(width));
    const cssH = Math.max(1, Math.round(height));
    const rawDpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const maxDprForBudget = Math.sqrt(MAX_CANVAS_PIXELS / (cssW * cssH));
    const dpr = Math.max(1, Math.min(rawDpr, maxDprForBudget));

    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    if (maxCount <= 0 || sourceWidth <= 0 || sourceHeight <= 0) return;

    // Full-page overlay size in CSS px (matches HeatmapViewer).
    const overlayHeight = Math.max(cssH, (sourceHeight / sourceWidth) * cssW);
    const scaleX = cssW / sourceWidth;
    const scaleY = overlayHeight / sourceHeight;
    const cellW = Math.max(1, GRID_SIZE_PX * scaleX);
    const cellH = Math.max(1, GRID_SIZE_PX * scaleY);

    for (const cell of cells) {
      const x = cell.gx * GRID_SIZE_PX * scaleX;
      const y = cell.gy * GRID_SIZE_PX * scaleY - offsetY;
      if (y + cellH < 0 || y > cssH || x + cellW < 0 || x > cssW) continue;
      ctx.fillStyle = heatColor(cell.count / maxCount);
      ctx.fillRect(x, y, cellW, cellH);
    }
  }, [cells, maxCount, sourceWidth, sourceHeight, width, height, offsetY]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
