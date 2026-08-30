import { cn } from "@/lib/utils";
import type { GaugeModel, GaugeTone } from "@/lib/seo/overview";

const TONE: Record<GaugeTone, { ring: string; text: string }> = {
  idle: { ring: "oklch(0.45 0 0)", text: "text-muted-foreground" },
  good: { ring: "var(--primary)", text: "text-primary" },
  mid: { ring: "oklch(0.82 0.14 85)", text: "text-amber-200" },
  bad: { ring: "var(--destructive)", text: "text-destructive" },
};

export function SeoGauge({ model }: { model: GaugeModel }) {
  const pct = model.value == null ? 0 : Math.max(0, Math.min(100, model.value));
  const colors = TONE[model.tone];

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-3 py-5">
      <div
        className="seo-gauge relative grid size-[7.25rem] place-items-center rounded-full"
        style={{
          background: `conic-gradient(${colors.ring} ${pct * 3.6}deg, oklch(0.3 0 0) 0deg)`,
        }}
        role="img"
        aria-label={
          model.value == null
            ? `${model.label}: no data`
            : `${model.label}: ${model.value} of 100`
        }
      >
        <div className="grid size-[5.35rem] place-items-center rounded-full bg-background">
          <p
            className={cn(
              "text-2xl font-bold tabular-nums leading-none",
              colors.text
            )}
          >
            {model.display}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold">{model.label}</p>
      <p className="mt-1 max-w-[11rem] text-center text-xs leading-snug text-muted-foreground">
        {model.caption}
      </p>
    </div>
  );
}
