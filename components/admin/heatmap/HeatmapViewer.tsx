"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "@/components/admin/heatmap/DeviceFrame";
import { HeatmapCanvas } from "@/components/admin/heatmap/HeatmapCanvas";
import { HEATMAP_PREVIEW_PARAM } from "@/lib/analytics/constants";
import {
  resolveReplayDevice,
  safeReplayFrame,
} from "@/lib/analytics/replayFrame";
import type { GridCell, HeatmapDevice } from "@/lib/analytics/types";

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
  const resolvedDevice = useMemo(
    () =>
      resolveReplayDevice({
        device,
        viewportW: previewW || sourceWidth,
      }),
    [device, previewW, sourceWidth]
  );
  const view = useMemo(() => safeReplayFrame(resolvedDevice), [resolvedDevice]);

  const [frameSize, setFrameSize] = useState({
    documentH: sourceHeight,
    scrollY: 0,
  });

  const src = `${siteUrl}${page === "/" ? "/" : page}?${HEATMAP_PREVIEW_PARAM}=1`;

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as {
        type?: string;
        documentH?: number;
        scrollY?: number;
      } | null;
      if (!data || (data.type !== "heatmap-ready" && data.type !== "heatmap-viewport")) {
        return;
      }
      setFrameSize((current) => ({
        documentH:
          typeof data.documentH === "number" && data.documentH > 0
            ? data.documentH
            : current.documentH,
        scrollY: typeof data.scrollY === "number" ? data.scrollY : current.scrollY,
      }));
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const recordedWidth = Math.max(1, sourceWidth || view.w);
  const recordedHeight = Math.max(1, sourceHeight || frameSize.documentH || view.h);
  const overlayHeight = Math.max(view.h, (recordedHeight / recordedWidth) * view.w);
  const previewDocH = Math.max(frameSize.documentH, recordedHeight, 1);
  const offsetY = frameSize.scrollY * (overlayHeight / previewDocH);

  return (
    <DeviceFrame viewportW={view.w} viewportH={view.h} device={resolvedDevice}>
      <iframe
        ref={frameRef}
        src={src}
        title={`Preview of ${page}`}
        width={view.w}
        height={view.h}
        className="block bg-background"
        style={{ width: view.w, height: view.h, border: 0 }}
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <HeatmapCanvas
          cells={cells}
          maxCount={maxCount}
          sourceWidth={recordedWidth}
          sourceHeight={recordedHeight}
          width={view.w}
          height={view.h}
          offsetY={offsetY}
        />
      </div>
    </DeviceFrame>
  );
}
