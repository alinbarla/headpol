"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HeatmapDevice } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export function useDeviceFit(viewportW: number, viewportH: number) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    function update() {
      if (!host) return;
      const maxW = Math.max(host.clientWidth, 1);
      const maxH = Math.min(window.innerHeight * 0.72, 860);
      setScale(Math.min(maxW / Math.max(viewportW, 1), maxH / Math.max(viewportH, 1)));
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [viewportH, viewportW]);

  return { hostRef, scale };
}

export function DeviceFrame({
  viewportW,
  viewportH,
  device,
  children,
}: {
  viewportW: number;
  viewportH: number;
  device: HeatmapDevice;
  children: ReactNode;
}) {
  const { hostRef, scale } = useDeviceFit(viewportW, viewportH);
  const compact = device === "mobile" || viewportW < 768;

  return (
    <div ref={hostRef} className="w-full">
      <div className="flex flex-col items-center">
        <p className="mb-2 text-xs text-muted-foreground">
          {device} · {Math.round(viewportW)}×{Math.round(viewportH)}
        </p>
        <div
          className={cn(
            "relative overflow-hidden bg-black/40",
            compact
              ? "rounded-[2rem] shadow-lg ring-8 ring-zinc-800"
              : "rounded-lg border border-border"
          )}
          style={{
            width: viewportW * scale,
            height: viewportH * scale,
          }}
        >
          <div
            className="absolute left-0 top-0 overflow-hidden"
            style={{
              width: viewportW,
              height: viewportH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
