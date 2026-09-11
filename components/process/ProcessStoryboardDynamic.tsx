"use client";

import dynamic from "next/dynamic";

const ProcessStoryboard = dynamic(
  () =>
    import("@/components/process/ProcessStoryboard").then((m) => ({
      default: m.ProcessStoryboard,
    })),
  {
    loading: () => (
      <section id="process" className="section-anchor py-24 sm:py-32" aria-busy="true">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="min-h-[24rem] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        </div>
      </section>
    ),
  }
);

export function ProcessStoryboardDynamic() {
  return <ProcessStoryboard />;
}
