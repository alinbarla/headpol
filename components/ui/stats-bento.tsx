"use client";

import Link from "next/link";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatsBentoProps = {
  className?: string;
  /** Large hero tile (e.g. month revenue). */
  primary: {
    eyebrow: string;
    value: string;
    description: string;
    href?: string;
  };
  /** Wide tile with sparkline bars (e.g. week revenue + channel mix). */
  growth: {
    label: string;
    value: string;
    /** Relative bar heights 0–100. */
    bars: number[];
    href?: string;
  };
  /** Compact tile (e.g. jobs today). */
  spotlight: {
    value: string;
    label: string;
    href?: string;
  };
  /** Rating-style tile (e.g. paid conversion). */
  highlight: {
    value: string;
    label: string;
    href?: string;
  };
};

function TileLink({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link href={href} className={cn(className, "transition-opacity hover:opacity-95")}>
      {children}
    </Link>
  );
}

/**
 * Bento-style KPI board. Lives under `components/ui` as requested; this repo’s
 * shadcn alias points at `components/shadcn`, so shared primitives stay there.
 */
export function StatsBento({
  className,
  primary,
  growth,
  spotlight,
  highlight,
}: StatsBentoProps) {
  return (
    <section className={cn("w-full", className)}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2">
        <TileLink
          href={primary.href}
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-primary p-8 md:col-span-3 md:row-span-2 md:p-10"
        >
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,#808080_0px_1px,transparent_1px_10px)] opacity-30 mask-[radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)]" />
          <div className="relative">
            <span className="mb-6 inline-block rounded-full bg-primary-foreground/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-primary-foreground/60 uppercase">
              {primary.eyebrow}
            </span>
            <h3 className="text-5xl tracking-tighter text-primary-foreground sm:text-6xl">
              {primary.value}
            </h3>
          </div>
          <p className="relative mt-6 max-w-xs text-sm text-primary-foreground/60">
            {primary.description}
          </p>
        </TileLink>

        <TileLink
          href={growth.href}
          className="flex items-center justify-between rounded-3xl border border-border bg-muted p-6 md:col-span-3 md:p-8"
        >
          <div>
            <p className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {growth.label}
            </p>
            <p className="text-3xl text-foreground tabular-nums">{growth.value}</p>
          </div>
          <div className="flex h-10 items-end gap-1" aria-hidden="true">
            {growth.bars.map((height, index) => (
              <div
                key={`${height}-${index}`}
                className="w-1.5 rounded-full bg-foreground"
                style={{ height: `${Math.max(8, Math.min(100, height))}%` }}
              />
            ))}
          </div>
        </TileLink>

        <TileLink
          href={spotlight.href}
          className="flex flex-col justify-center rounded-3xl border border-border bg-card p-6 text-center md:col-span-1"
        >
          <p className="text-2xl text-foreground tabular-nums">{spotlight.value}</p>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {spotlight.label}
          </p>
        </TileLink>

        <TileLink
          href={highlight.href}
          className="flex items-center gap-4 rounded-3xl bg-muted p-6 md:col-span-2"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-sm">
            <StarIcon className="size-5 fill-current" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm leading-none text-foreground tabular-nums">
              {highlight.value}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {highlight.label}
            </p>
          </div>
        </TileLink>
      </div>
    </section>
  );
}

export default StatsBento;
