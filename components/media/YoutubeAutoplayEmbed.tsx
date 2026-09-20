"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { PPF_YOUTUBE, youtubeEmbedSrc } from "@/lib/youtube";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

const YT_PRECONNECT = [
  "https://www.youtube-nocookie.com",
  "https://i.ytimg.com",
] as const;

function ensurePreconnect() {
  for (const href of YT_PRECONNECT) {
    if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
      continue;
    }
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}

type YoutubeAutoplayEmbedProps = {
  autoPlay?: boolean;
  priority?: boolean;
  className?: string;
  title?: string;
  caption?: string;
  watchLabel?: string;
  mutedLabel?: string;
  /** HTML id for the figure (PPF page uses `video` to match JSON-LD @id). */
  id?: string;
};

export function YoutubeAutoplayEmbed({
  autoPlay = true,
  priority = false,
  className,
  title = PPF_YOUTUBE.title,
  caption,
  watchLabel = "YouTube",
  mutedLabel = "Ljud av",
  id,
}: YoutubeAutoplayEmbedProps) {
  const reducedMotion = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const titleId = useId();
  const shouldAutoplay = autoPlay && !reducedMotion;
  const playerActive = inView;

  useEffect(() => {
    ensurePreconnect();
  }, []);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    const alreadyVisible = () => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      return rect.top < vh + 280 && rect.bottom > -280;
    };

    if (alreadyVisible()) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "280px 0px", threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const src = youtubeEmbedSrc({
    autoplay: shouldAutoplay,
    mute: true,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
  });

  return (
    <figure id={id} className={cn("w-full", className)} aria-labelledby={titleId}>
      <div
        ref={hostRef}
        className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-void shadow-[0_0_60px_rgba(0,0,0,0.35)]"
      >
        <Image
          src={PPF_YOUTUBE.posterSrc}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
          className={cn(
            "object-cover transition-opacity duration-500",
            iframeLoaded ? "opacity-0" : "opacity-100"
          )}
        />

        {playerActive ? (
          <iframe
            src={src}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading={priority ? "eager" : "lazy"}
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setIframeLoaded(true)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setInView(true)}
            className="absolute inset-0 flex items-center justify-center bg-void/20 transition-colors hover:bg-void/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-beam"
            aria-label={title}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-beam/40 bg-void/80 text-beam shadow-[0_0_30px_rgba(255,243,38,0.25)] sm:h-20 sm:w-20">
              <svg
                viewBox="0 0 24 24"
                className="ml-0.5 h-7 w-7 sm:h-8 sm:w-8"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5.14v13.72L19.27 12 8 5.14Z" />
              </svg>
            </span>
          </button>
        )}

        {shouldAutoplay && playerActive && !iframeLoaded ? (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/15 bg-void/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
            {mutedLabel}
          </span>
        ) : null}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p id={titleId} className="text-sm leading-relaxed text-text-secondary">
          {caption ?? title}
        </p>
        <a
          href={PPF_YOUTUBE.watchUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="shrink-0 text-sm font-semibold text-beam hover:underline"
        >
          {watchLabel}
        </a>
      </figcaption>

      <noscript>
        <iframe
          src={youtubeEmbedSrc({ autoplay: false, mute: true })}
          title={title}
          width={PPF_YOUTUBE.width}
          height={PPF_YOUTUBE.height}
          className="mt-3 aspect-video w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </noscript>
    </figure>
  );
}
