"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/lib/useReducedMotion";

const VIDEO_SRC = "/videos/stralkastare-polering.mp4";
const POSTER = "/images/gallery/stralkastarepolering-fore-efter.jpg";

/** Default playback speed for the showcase clip. */
const PLAYBACK_RATE = 1.5;

export function HeroShowcaseVideo() {
  const t = useTranslations("hero");
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Some browsers reset playbackRate on load/rate change, so keep enforcing it.
    const applyRate = () => {
      if (video.playbackRate !== PLAYBACK_RATE) {
        video.playbackRate = PLAYBACK_RATE;
      }
    };

    applyRate();
    video.addEventListener("loadedmetadata", applyRate);
    video.addEventListener("play", applyRate);
    video.addEventListener("ratechange", applyRate);

    if (reducedMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {
        /* Autoplay can be blocked; controls fallback covers it. */
      });
    }

    return () => {
      video.removeEventListener("loadedmetadata", applyRate);
      video.removeEventListener("play", applyRate);
      video.removeEventListener("ratechange", applyRate);
    };
  }, [reducedMotion]);

  return (
    <div className="hero-video-frame block w-full overflow-hidden rounded-2xl border border-beam/20 shadow-[0_0_60px_rgba(255,243,38,0.12)]">
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        poster={POSTER}
        muted
        loop
        playsInline
        autoPlay={!reducedMotion}
        controls={reducedMotion}
        preload="metadata"
        aria-label={t("videoAlt")}
      />
    </div>
  );
}
