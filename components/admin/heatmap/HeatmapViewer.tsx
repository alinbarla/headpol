"use client";

import { useEffect, useRef, useState } from "react";
import { HeatmapCanvas } from "@/components/admin/heatmap/HeatmapCanvas";
import { HEATMAP_PREVIEW_PARAM } from "@/lib/analytics/constants";
import type { GridCell } from "@/lib/analytics/types";

const PREVIEW_HEIGHT = 640;

export function HeatmapViewer({
  siteUrl,
  page,
  cells,
  maxCount,
  sourceWidth,
  sourceHeight,
}: {
  siteUrl: string;
  page: string;
  cells: GridCell[];
  maxCount: number;
  sourceWidth: number;
  sourceHeight: number;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameSize, setFrameSize] = useState({
    width: 360,
    height: PREVIEW_HEIGHT,
    documentH: sourceHeight,
    documentW: sourceWidth,
    scrollY: 0,
  });

  const src = `${siteUrl}${page === "/" ? "/" : page}?${HEATMAP_PREVIEW_PARAM}=1`;

  useEffect(() => {
    function measure() {
      const frame = frameRef.current;
      if (!frame) return;
      setFrameSize((current) => ({
        ...current,
        width: frame.clientWidth || 360,
        height: frame.clientHeight || PREVIEW_HEIGHT,
      }));
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as {
        type?: string;
        documentH?: number;
        documentW?: number;
        scrollY?: number;
      } | null;
      if (!data || (data.type !== "heatmap-ready" && data.type !== "heatmap-viewport")) {
        return;
      }
      setFrameSize((current) => ({
        ...current,
        documentH:
          typeof data.documentH === "number" ? data.documentH : current.documentH,
        documentW:
          typeof data.documentW === "number" ? data.documentW : current.documentW,
        scrollY: typeof data.scrollY === "number" ? data.scrollY : current.scrollY,
      }));
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const recordedWidth = Math.max(sourceWidth, 1);
  const recordedHeight = Math.max(sourceHeight || frameSize.documentH, 1);
  const overlayHeight = Math.max(
    frameSize.height,
    (recordedHeight / recordedWidth) * frameSize.width
  );
  const previewDocH = Math.max(frameSize.documentH, 1);
  const offsetY = -frameSize.scrollY * (overlayHeight / previewDocH);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-black/40">
      <iframe
        ref={frameRef}
        src={src}
        title={`Preview of ${page}`}
        className="block h-[640px] w-full bg-background"
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="relative"
          style={{
            width: frameSize.width,
            height: overlayHeight,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          <HeatmapCanvas
            cells={cells}
            maxCount={maxCount}
            sourceWidth={recordedWidth}
            sourceHeight={recordedHeight}
            width={frameSize.width}
            height={overlayHeight}
          />
        </div>
      </div>
    </div>
  );
}
