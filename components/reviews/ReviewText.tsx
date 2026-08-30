"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

export function ReviewText({
  text,
  moreLabel,
  lessLabel,
}: {
  text: string;
  moreLabel: string;
  lessLabel: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const textId = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    if (expanded) return;
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, text]);

  const showToggle = overflows || expanded;

  return (
    <div className="mt-3">
      <p
        ref={ref}
        id={textId}
        className={`text-sm leading-relaxed break-words text-text-secondary ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {text}
      </p>
      {showToggle ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={textId}
          className="mt-1 text-sm font-semibold text-beam hover:underline"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </div>
  );
}
