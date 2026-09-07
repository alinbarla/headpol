import { REPLAY_FRAME } from "@/lib/analytics/constants";
import type { HeatmapDevice } from "@/lib/analytics/types";

/** Hard caps — full-page iframes above this OOM mobile Safari (and some desktops). */
export const MAX_FRAME_W = 1024;
export const MAX_FRAME_H = 844;
/** Area budget (~desktop 1024×640). Phone 390×844 stays under this. */
export const MAX_FRAME_AREA = 1024 * 640;

export function resolveReplayDevice(input: {
  device?: HeatmapDevice | "all" | null;
  viewportW?: number | null;
}): HeatmapDevice {
  if (input.device === "mobile" || input.device === "tablet" || input.device === "desktop") {
    if (input.device === "mobile") return "mobile";
    if (input.device === "tablet") return "tablet";
    return "desktop";
  }
  const w = input.viewportW ?? 1280;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/**
 * Canonical, memory-safe iframe size for a device class.
 * Never returns the raw recorded monitor size (those can be 2K/4K and crash).
 */
export function safeReplayFrame(device: HeatmapDevice): { w: number; h: number } {
  if (device === "mobile") {
    return { w: REPLAY_FRAME.mobile.w, h: REPLAY_FRAME.mobile.h };
  }
  if (device === "tablet") {
    return {
      w: Math.min(REPLAY_FRAME.tablet.w, 768),
      h: Math.min(REPLAY_FRAME.tablet.h, MAX_FRAME_H),
    };
  }
  return {
    w: Math.min(REPLAY_FRAME.desktop.w, MAX_FRAME_W),
    h: Math.min(REPLAY_FRAME.desktop.h, MAX_FRAME_H),
  };
}

/** Clamp any width/height pair into the safe iframe budget. */
export function clampFrameSize(width: number, height: number): { w: number; h: number } {
  let w = Math.max(1, Math.min(Math.round(width) || 1, MAX_FRAME_W));
  let h = Math.max(1, Math.min(Math.round(height) || 1, MAX_FRAME_H));
  const area = w * h;
  if (area > MAX_FRAME_AREA) {
    const scale = Math.sqrt(MAX_FRAME_AREA / area);
    w = Math.max(1, Math.floor(w * scale));
    h = Math.max(1, Math.floor(h * scale));
  }
  return { w, h };
}
