"use client";

import { useState, useTransition } from "react";
import {
  findSessionsByIpAction,
  type SessionMatch,
} from "@/app/admin/actions";
import { ACQUISITION_LABELS } from "@/lib/admin/labels";
import {
  MANUAL_REFERRAL_OTHER,
  MANUAL_REFERRAL_PRESETS,
} from "@/lib/attribution/constants";
import { formatTimestamp } from "@/lib/time";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";

type AcquisitionChoice =
  | "none"
  | "google_ads"
  | "organic_search"
  | "direct"
  | "referral";

/**
 * Optional marketing origin + optional visitor IP / session link for manual
 * (phone) bookings. Session linking stays blank unless the owner picks one.
 */
export function ManualBookingTrafficFields() {
  const [channel, setChannel] = useState<AcquisitionChoice>("none");
  const [referrerPreset, setReferrerPreset] = useState<string>(
    MANUAL_REFERRAL_PRESETS[0]?.value ?? MANUAL_REFERRAL_OTHER
  );
  const [visitorIp, setVisitorIp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [matches, setMatches] = useState<SessionMatch[] | null>(null);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function lookupSessions() {
    setLookupMessage(null);
    startTransition(async () => {
      const result = await findSessionsByIpAction(visitorIp);
      if (!result.ok) {
        setMatches(null);
        setSessionId("");
        setLookupMessage(result.message ?? "Lookup failed");
        return;
      }
      const sessions = result.sessions ?? [];
      setMatches(sessions);
      setSessionId("");
      setLookupMessage(
        sessions.length === 0
          ? "No visitor sessions found for that IP in the last 30 days."
          : `Found ${sessions.length} session${sessions.length === 1 ? "" : "s"}. Linking is optional.`
      );
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/80 bg-secondary/20 p-3">
      <div>
        <p className="text-sm font-medium">Traffic source</p>
        <p className="text-xs text-muted-foreground">
          Where the customer found you — Google Ads, organic search, or a
          referral such as ChatGPT.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acquisitionChannel">How they found you</Label>
        <Select
          name="acquisitionChannel"
          value={channel}
          onValueChange={(value) => setChannel(value as AcquisitionChoice)}
        >
          <SelectTrigger id="acquisitionChannel" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not sure</SelectItem>
            <SelectItem value="google_ads">
              {ACQUISITION_LABELS.google_ads}
            </SelectItem>
            <SelectItem value="organic_search">
              {ACQUISITION_LABELS.organic_search}
            </SelectItem>
            <SelectItem value="referral">
              {ACQUISITION_LABELS.referral}
            </SelectItem>
            <SelectItem value="direct">{ACQUISITION_LABELS.direct}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {channel === "referral" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="referrerPreset">Referral from</Label>
            <Select
              name="referrerPreset"
              value={referrerPreset}
              onValueChange={setReferrerPreset}
            >
              <SelectTrigger id="referrerPreset" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_REFERRAL_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value={MANUAL_REFERRAL_OTHER}>Other…</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {referrerPreset === MANUAL_REFERRAL_OTHER && (
            <div className="space-y-1.5">
              <Label htmlFor="referrerHost">Referrer host</Label>
              <Input
                id="referrerHost"
                name="referrerHost"
                placeholder="example.com"
                maxLength={200}
                required
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5 border-t border-border/60 pt-3">
        <Label htmlFor="visitorIp">Visitor IP (optional)</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="visitorIp"
            name="visitorIp"
            value={visitorIp}
            onChange={(event) => {
              setVisitorIp(event.target.value);
              setMatches(null);
              setSessionId("");
              setLookupMessage(null);
            }}
            placeholder="e.g. 85.224.12.34"
            maxLength={45}
            autoComplete="off"
            className="font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending || !visitorIp.trim()}
            onClick={lookupSessions}
          >
            {pending ? "Looking up…" : "Find sessions"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          If you know the caller&apos;s IP from Visitors, you can store it here
          and optionally attach one matching session.
        </p>
      </div>

      <input type="hidden" name="analyticsSessionId" value={sessionId} />

      {lookupMessage && (
        <p className="text-xs text-muted-foreground">{lookupMessage}</p>
      )}

      {matches && matches.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Link visitor session</legend>
          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm">
            <input
              type="radio"
              name="analyticsSessionChoice"
              className="mt-1"
              checked={sessionId === ""}
              onChange={() => setSessionId("")}
            />
            <span>
              Don&apos;t link a session
              <span className="block text-xs text-muted-foreground">
                Keep the IP on the booking only.
              </span>
            </span>
          </label>
          {matches.map((session) => {
            const channelLabel = session.acquisition_channel
              ? ACQUISITION_LABELS[session.acquisition_channel] ??
                session.acquisition_channel
              : "Unknown source";
            const place = [session.city, session.country]
              .filter(Boolean)
              .join(", ");
            return (
              <label
                key={session.id}
                className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="analyticsSessionChoice"
                  className="mt-1"
                  checked={sessionId === session.id}
                  onChange={() => setSessionId(session.id)}
                />
                <span className="min-w-0">
                  <span className="font-medium">{session.page}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatTimestamp(session.started_at)} · {session.device} ·{" "}
                    {channelLabel}
                    {session.referrer_host ? ` · ${session.referrer_host}` : ""}
                    {place ? ` · ${place}` : ""}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
