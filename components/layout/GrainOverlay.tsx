"use client";

import { useEffect, useState } from "react";

/**
 * Full-page film grain. Its SVG fractal-noise filter is the most expensive
 * thing to rasterise on first paint (it held back FCP/LCP by ~150 ms in
 * Lighthouse traces), so it is added after window `load` instead. At 3.5%
 * opacity nobody sees it arrive.
 */
export function GrainOverlay() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let frameId: number | undefined;

    const show = () => {
      frameId = window.requestAnimationFrame(() => setReady(true));
    };

    if (document.readyState === "complete") show();
    else window.addEventListener("load", show, { once: true });

    return () => {
      window.removeEventListener("load", show);
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
    };
  }, []);

  if (!ready) return null;
  return <div className="grain-overlay" aria-hidden="true" />;
}
