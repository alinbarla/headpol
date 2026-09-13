"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Frown, Meh, Smile, Sparkles } from "lucide-react";
import type { AcquisitionFunnelData } from "@/lib/admin/funnel";
import { SentimentAnalysisCard } from "@/components/ui/card-9";
import { MarketingDashboard } from "@/components/ui/dashboard-1";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=80",
];

const CHANNEL_COLORS: Record<string, string> = {
  google_ads: "bg-amber-400",
  organic_search: "bg-lime-400",
  direct: "bg-sky-400",
  referral: "bg-violet-400",
  unknown: "bg-slate-500",
};

const DEVICE_COLORS: Record<string, string> = {
  mobile: "bg-sky-400",
  tablet: "bg-cyan-400",
  desktop: "bg-violet-400",
};

export type InsightDeviceMix = {
  mobile: number;
  tablet: number;
  desktop: number;
};

export type InsightQuality = {
  deep: number;
  active: number;
  light: number;
  beacon: number;
};

export type InsightPeople = Array<{ id: string; name: string }>;

export function DashboardInsights({
  days,
  funnel,
  devices,
  quality,
  people,
  uniqueVisitors,
}: {
  days: 7 | 30;
  funnel: AcquisitionFunnelData;
  devices: InsightDeviceMix;
  quality: InsightQuality;
  people: InsightPeople;
  uniqueVisitors: number;
}) {
  const router = useRouter();
  const [mix, setMix] = useState<"channel" | "device">("channel");
  const [lens, setLens] = useState<"engagement" | "conversion">("engagement");

  const channelStats = useMemo(() => {
    const total = Math.max(1, funnel.totals.sessions);
    return funnel.byChannel
      .filter((row) => row.sessions > 0)
      .map((row) => ({
        label: row.label,
        value: Math.round((row.sessions / total) * 100),
        color: CHANNEL_COLORS[row.channel] ?? "bg-slate-500",
      }));
  }, [funnel]);

  const deviceTotal = Math.max(
    1,
    devices.mobile + devices.tablet + devices.desktop
  );
  const deviceStats = [
    {
      label: "Mobile",
      value: Math.round((devices.mobile / deviceTotal) * 100),
      color: DEVICE_COLORS.mobile,
    },
    {
      label: "Tablet",
      value: Math.round((devices.tablet / deviceTotal) * 100),
      color: DEVICE_COLORS.tablet,
    },
    {
      label: "Desktop",
      value: Math.round((devices.desktop / deviceTotal) * 100),
      color: DEVICE_COLORS.desktop,
    },
  ].filter((stat) => stat.value > 0);

  const paid = funnel.totals.paidCount;
  const started = funnel.totals.bookingsStarted;
  const abandoned = Math.max(0, started - paid);
  const bounced = Math.max(0, funnel.totals.sessions - started);

  const conversionData = [
    {
      label: "Paid",
      value: paid,
      color: "bg-emerald-500",
      icon: <Smile className="size-4 text-emerald-500" />,
    },
    {
      label: "Started",
      value: abandoned,
      color: "bg-amber-500",
      icon: <Meh className="size-4 text-amber-500" />,
    },
    {
      label: "Browse only",
      value: bounced,
      color: "bg-rose-500",
      icon: <Frown className="size-4 text-rose-500" />,
    },
  ];

  const engagementData = [
    {
      label: "Deep",
      value: quality.deep,
      color: "bg-emerald-500",
      icon: <Smile className="size-4 text-emerald-500" />,
    },
    {
      label: "Active",
      value: quality.active,
      color: "bg-lime-400",
      icon: <Meh className="size-4 text-lime-400" />,
    },
    {
      label: "Light",
      value: quality.light + quality.beacon,
      color: "bg-rose-500",
      icon: <Frown className="size-4 text-rose-500" />,
    },
  ];

  const sentiment = lens === "conversion" ? conversionData : engagementData;
  const sentimentTotal = sentiment.reduce((sum, item) => sum + item.value, 0);
  const topShare =
    sentimentTotal > 0
      ? Math.round((sentiment[0].value / sentimentTotal) * 100)
      : 0;

  return (
    <section className="mt-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Live mix
        </h2>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Last {days} days
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={String(days)}
                onValueChange={(value) => {
                  const next = new URLSearchParams(window.location.search);
                  if (value === "7") next.set("insight", "7");
                  else next.delete("insight");
                  const query = next.toString();
                  router.push(query ? `/admin?${query}` : "/admin");
                }}
              >
                <DropdownMenuRadioItem value="7">7 days</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="30">30 days</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {mix === "channel" ? "By channel" : "By device"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Traffic mix</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={mix}
                onValueChange={(value) =>
                  setMix(value as "channel" | "device")
                }
              >
                <DropdownMenuRadioItem value="channel">
                  Channel
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="device">
                  Device
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {lens === "engagement" ? "Engagement" : "Conversion"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quality lens</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={lens}
                onValueChange={(value) =>
                  setLens(value as "engagement" | "conversion")
                }
              >
                <DropdownMenuRadioItem value="engagement">
                  Session depth
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="conversion">
                  Booking funnel
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <MarketingDashboard
          title={mix === "channel" ? "Acquisition mix" : "Device mix"}
          teamActivities={{
            totalHours: mix === "channel" ? funnel.totals.sessions : deviceTotal,
            unitLabel: "visits",
            stats: mix === "channel" ? channelStats : deviceStats,
          }}
          team={{
            memberCount: uniqueVisitors,
            unitLabel: "visitors",
            members: people.slice(0, 4).map((person, index) => ({
              id: person.id,
              name: person.name,
              avatarUrl: AVATARS[index % AVATARS.length],
            })),
          }}
          cta={{
            text: "Open the visitor log and replay sessions",
            buttonText: "See visitors",
            onButtonClick: () => router.push("/admin/visitors"),
          }}
          onFilterClick={() => router.push("/admin/visitors")}
        />

        <SentimentAnalysisCard
          title={lens === "conversion" ? "Booking sentiment" : "Visit depth"}
          overallSentiment={
            topShare >= 50
              ? `Mostly ${sentiment[0].label.toLowerCase()}`
              : "Mixed"
          }
          overallSentimentIcon={<Sparkles className="size-4 text-emerald-400" />}
          data={sentiment}
        />
      </div>
    </section>
  );
}
