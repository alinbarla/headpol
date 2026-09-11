"use client";

import dynamic from "next/dynamic";

const ResultCompare = dynamic(
  () =>
    import("@/components/reviews/ResultCompare").then((m) => ({
      default: m.ResultCompare,
    })),
  {
    loading: () => (
      <div
        className="aspect-[16/10] w-full animate-pulse rounded-3xl border border-white/5 bg-white/5"
        aria-busy="true"
      />
    ),
  }
);

export function ResultCompareDynamic() {
  return <ResultCompare />;
}
