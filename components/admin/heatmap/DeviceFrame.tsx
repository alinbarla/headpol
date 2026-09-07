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
      setScale(
        Math.min(maxW / Math.max(viewportW, 1), maxH / Math.max(viewportH, 1), 1)
      );
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
  const phone = device === "mobile";
  const tablet = device === "tablet";
  const screenW = viewportW * scale;
  const screenH = viewportH * scale;

  return (
    <div ref={hostRef} className="w-full">
      <div className="flex flex-col items-center">
        <p className="mb-2 text-xs text-muted-foreground">
          {device} · {Math.round(viewportW)}×{Math.round(viewportH)}
        </p>

        {phone || tablet ? (
          <div
            className={cn(
              "bg-zinc-900 shadow-xl ring-1 ring-zinc-700",
              phone ? "rounded-[2.75rem] p-3" : "rounded-[1.75rem] p-2.5"
            )}
          >
            {phone ? (
              <div className="mb-2 flex justify-center">
                <div className="h-5 w-28 rounded-full bg-black" />
              </div>
            ) : null}
            <div
              className={cn(
                "relative overflow-hidden bg-black",
                phone ? "rounded-[2.1rem]" : "rounded-[1.25rem]"
              )}
              style={{ width: screenW, height: screenH }}
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
        ) : (
          <div
            className="overflow-hidden rounded-xl border border-border bg-muted shadow-lg"
            style={{ width: screenW }}
          >
            <div className="flex h-9 items-center gap-2 border-b border-border bg-secondary/80 px-3">
              <span className="size-2.5 rounded-full bg-red-400/80" />
              <span className="size-2.5 rounded-full bg-amber-400/80" />
              <span className="size-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 truncate rounded-md bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                desktop · {Math.round(viewportW)}×{Math.round(viewportH)}
              </span>
            </div>
            <div
              className="relative overflow-hidden bg-background"
              style={{ width: screenW, height: screenH }}
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
        )}
      </div>
    </div>
  );
}
