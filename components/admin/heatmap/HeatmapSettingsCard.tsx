"use client";

import { useActionState, useState } from "react";
import {
  purgeAnalyticsAction,
  updateAnalyticsSettingsAction,
} from "@/app/admin/heatmap/actions";
import type { ActionState } from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Switch } from "@/components/shadcn/switch";
import type { AnalyticsSettings } from "@/lib/analytics/types";

const initial: ActionState = { ok: true };

export function HeatmapSettingsCard({ settings }: { settings: AnalyticsSettings }) {
  const [state, formAction] = useActionState(updateAnalyticsSettingsAction, initial);
  const [purgeState, purgeAction] = useActionState(purgeAnalyticsAction, initial);
  const [enabled, setEnabled] = useState(settings.enabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Heatmap collection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActionToast state={state} />
        <ActionToast state={purgeState} />
        <p className="text-sm text-muted-foreground">
          First-party clicks, cursor movement, scroll and form text on the
          public site, plus visitor device, IP and traffic source for the
          Visitors page. Password and payment fields are not stored. Sample
          rate applies to heatmap events only — every visit is recorded when
          collection is on.
        </p>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="enabled" value={enabled ? "true" : "false"} />
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="heatmap-enabled">Collect events</Label>
            <Switch
              id="heatmap-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sampleRate">Sample rate (0–1)</Label>
            <Input
              id="sampleRate"
              name="sampleRate"
              type="number"
              min={0}
              max={1}
              step={0.1}
              defaultValue={settings.sampleRate}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="retentionDays">Retention (days)</Label>
            <Input
              id="retentionDays"
              name="retentionDays"
              type="number"
              min={1}
              max={365}
              defaultValue={settings.retentionDays}
              required
            />
          </div>
          <SubmitButton>Save heatmap settings</SubmitButton>
        </form>

        <form
          action={purgeAction}
          onSubmit={(event) => {
            if (!window.confirm("Delete all heatmap sessions and events?")) {
              event.preventDefault();
            }
          }}
        >
          <Button type="submit" variant="destructive" size="sm">
            Purge heatmap data
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
