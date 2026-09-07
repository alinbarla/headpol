"use client";

import { useEffect, useRef, useState } from "react";
import { DeviceFrame } from "@/components/admin/heatmap/DeviceFrame";
import { HeatmapCanvas } from "@/components/admin/heatmap/HeatmapCanvas";
import { HEATMAP_PREVIEW_PARAM } from "@/lib/analytics/constants";
import type { GridCell, HeatmapDevice } from "@/lib/analytics/types";

const PREVIEW_HEIGHT = 640;

export function HeatmapViewer({
  siteUrl,
  page,
  cells,
  maxCount,
  sourceWidth,
  sourceHeight,
  previewW,
  previewH,
  device = "desktop",
}: {
  siteUrl: string;
  page: string;
  cells: GridCell[];
  maxCount: number;
  sourceWidth: number;
  sourceHeight: number;
  previewW?: number;
  previewH?: number;
  device?: HeatmapDevice;
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

  const frameW = Math.max(previewW || sourceWidth || 390, 1);
  const frameH = Math.max(previewH || PREVIEW_HEIGHT, 1);
  const recordedWidth = Math.max(sourceWidth || frameW, 1);
  const recordedHeight = Math.max(sourceHeight || frameSize.documentH, 1);
  // Logical full-page overlay height — used only for scroll mapping, not canvas allocation.
  const overlayHeight = Math.max(frameH, (recordedHeight / recordedWidth) * frameW);
  const previewDocH = Math.max(frameSize.documentH, recordedHeight, 1);
  const offsetY = frameSize.scrollY * (overlayHeight / previewDocH);

  return (
    <DeviceFrame viewportW={frameW} viewportH={frameH} device={device}>
      <iframe
        ref={frameRef}
        src={src}
        title={`Preview of ${page}`}
        width={frameW}
        height={frameH}
        className="block bg-background"
        style={{ width: frameW, height: frameH, border: 0 }}
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <HeatmapCanvas
          cells={cells}
          maxCount={maxCount}
          sourceWidth={recordedWidth}
          sourceHeight={recordedHeight}
          width={frameW}
          height={frameH}
          offsetY={offsetY}
        />
      </div>
    </DeviceFrame>
  );
}
