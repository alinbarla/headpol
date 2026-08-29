import {
  BikeIcon,
  CarFrontIcon,
  CheckIcon,
  TruckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PriceSticker } from "@/components/ui/PriceSticker";
import type { ClusterPriceTier } from "@/lib/content/types";

const ICONS = [CarFrontIcon, BikeIcon, TruckIcon];

export function PriceCards({ tiers }: { tiers: ClusterPriceTier[] }) {
  return (
    <div className="mt-10 grid items-stretch gap-6 md:grid-cols-3">
      {tiers.map((tier, index) => {
        const Icon = ICONS[index] ?? CarFrontIcon;
        const featured = Boolean(tier.featured);

        return (
          <article
            key={tier.title}
            className={`relative flex flex-col overflow-hidden rounded-[28px] p-7 sm:p-8 ${
                featured
                ? "border-2 border-beam bg-void-elevated shadow-[0_0_48px_rgba(255,243,38,0.12)] md:-translate-y-2 motion-reduce:md:translate-y-0"
                : "border border-white/10 bg-void-elevated"
            }`}
          >
            {tier.badge ? (
              <p className="absolute right-5 top-5 rounded-full bg-beam px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-void">
                {tier.badge}
              </p>
            ) : null}

            <div
              className={`flex size-14 items-center justify-center rounded-full ${
                featured ? "bg-beam text-void" : "bg-beam/15 text-beam"
              }`}
              aria-hidden="true"
            >
              <Icon className="size-7" strokeWidth={1.75} />
            </div>

            <h2 className="headline-display mt-6 text-2xl font-bold text-text-primary">
              {tier.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
              {tier.description}
            </p>

            <div className="mt-6">
              {tier.oldPrice && tier.unit ? (
                <PriceSticker
                  oldPrice={tier.oldPrice}
                  price={tier.price}
                  unit={tier.unit}
                />
              ) : (
                <p className="headline-display text-3xl font-bold text-beam">
                  {tier.price}
                </p>
              )}
            </div>

            {tier.includes && tier.includes.length > 0 ? (
              <ul className="mt-8 space-y-2.5 border-t border-white/10 pt-6">
                {tier.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-text-primary"
                  >
                    <CheckIcon
                      className="mt-0.5 size-4 shrink-0 text-beam"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <Button
              href={tier.href}
              variant={featured ? "primary" : "outline"}
              className="mt-8 w-full"
            >
              {tier.cta}
            </Button>
          </article>
        );
      })}
    </div>
  );
}
