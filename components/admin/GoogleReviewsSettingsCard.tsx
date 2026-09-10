"use client";

import { useActionState } from "react";
import { refreshGoogleReviewsAction } from "@/app/admin/settings/actions";
import type { ActionState } from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import type { PlaceReviewsSnapshot } from "@/lib/places/reviews";
import { formatTimestamp } from "@/lib/time";

const initial: ActionState = { ok: true };

export function GoogleReviewsSettingsCard({
  snapshot,
}: {
  snapshot: PlaceReviewsSnapshot;
}) {
  const [state, formAction] = useActionState(
    refreshGoogleReviewsAction,
    initial
  );

  const { data, fetchedAt, configured } = snapshot;
  const ratingLabel =
    data.rating != null
      ? data.rating.toLocaleString("sv-SE", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Google reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActionToast state={state} />
        <p className="text-sm text-muted-foreground">
          Pull live rating and reviews from Google Places into Supabase. The
          same job also runs on a Supabase pg_cron schedule (and as a backup
          from analytics retention).
        </p>

        <dl className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">API</dt>
            <dd>
              {configured ? (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">
                  Configured
                </span>
              ) : (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">
                  Missing PLACE_ID / API key
                </span>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Last fetched</dt>
            <dd className="text-xs text-muted-foreground">
              {formatTimestamp(fetchedAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Stored rating</dt>
            <dd className="font-mono text-xs">
              {ratingLabel != null && data.userRatingCount != null
                ? `${ratingLabel} (${data.userRatingCount})`
                : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Cached reviews</dt>
            <dd className="font-mono text-xs">{data.reviews.length}</dd>
          </div>
        </dl>

        <form action={formAction}>
          <SubmitButton pendingLabel="Fetching…" disabled={!configured}>
            Fetch Google reviews
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
