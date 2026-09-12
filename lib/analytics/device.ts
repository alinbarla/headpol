import type { HeatmapDevice } from "@/lib/analytics/types";

/**
 * Client-side device class for visit + heatmap beacons.
 * Prefer UA / touch so landscape phones and “Request Desktop Website”
 * still land in mobile/tablet instead of desktop.
 */
export function deviceFromViewport(): HeatmapDevice {
  if (typeof window === "undefined") return "desktop";

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const touchMac =
    typeof navigator !== "undefined" &&
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1;

  if (/iPhone|iPod|Android.+Mobile|Windows Phone|webOS|BlackBerry|IEMobile/i.test(ua)) {
    return "mobile";
  }
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua) || touchMac) {
    if (touchMac && Math.min(window.screen.width, window.screen.height) < 500) {
      return "mobile";
    }
    return "tablet";
  }

  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
