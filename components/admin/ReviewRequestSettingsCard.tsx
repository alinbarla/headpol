"use client";

import { useActionState, useState } from "react";
import { updateReviewRequestSettingsAction } from "@/app/admin/settings/actions";
import type { ActionState } from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Label } from "@/components/shadcn/label";
import { Switch } from "@/components/shadcn/switch";

const initial: ActionState = { ok: true };

type EmailPreview = { subject: string; html: string };

export function ReviewRequestSettingsCard({
  enabled: savedEnabled,
  maxJobAgeDays,
  preview,
}: {
  enabled: boolean;
  maxJobAgeDays: number;
  preview: { sv: EmailPreview; en: EmailPreview };
}) {
  const [state, formAction] = useActionState(
    updateReviewRequestSettingsAction,
    initial
  );
  const [enabled, setEnabled] = useState(savedEnabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Google review requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActionToast state={state} />
        <p className="text-sm text-muted-foreground">
          When on, marking a booking Completed emails the customer once with a
          thank-you and a direct link to write a Google review. Skipped when the
          booking has no email, the job date is in the future, or the job is
          more than {maxJobAgeDays} days old. Off until you switch it on.
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="enabled" value={enabled ? "true" : "false"} />
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="review-requests-enabled">Send review requests</Label>
            <Switch
              id="review-requests-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          <SubmitButton>Save review request setting</SubmitButton>
        </form>

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Preview with a sample name. Swedish goes to most customers; English
            only to bookings made on the English site.
          </p>
          <EmailPreviewBox preview={preview.sv} />
          <details className="text-sm">
            <summary className="cursor-pointer text-xs text-muted-foreground">
              English version
            </summary>
            <div className="mt-3">
              <EmailPreviewBox preview={preview.en} />
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}

function EmailPreviewBox({ preview }: { preview: EmailPreview }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3 text-sm">
      <p className="mb-2 text-xs text-muted-foreground">
        Subject: <span className="text-foreground">{preview.subject}</span>
      </p>
      {/* Built server-side from fixed copy with the sample name escaped. */}
      <div
        className="space-y-2 [&_a]:text-primary [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: preview.html }}
      />
    </div>
  );
}
