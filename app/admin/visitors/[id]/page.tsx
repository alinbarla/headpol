import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getBookedVisitorMarkers,
  getSessionBookedOverride,
  isVisitorBooked,
  listBookingsForVisitor,
} from "@/lib/admin/data";
import {
  ADMIN_LOCALE,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TONE,
  SOURCE_LABELS,
  STATUS_TONE,
  acquisitionLabel,
} from "@/lib/admin/labels";
import { SESSION_STRENGTH_LABELS, engagementStrength } from "@/lib/admin/recordsRows";
import {
  getSessionById,
  listSessionsByVisitorId,
} from "@/lib/analytics/store";
import { describeLocation } from "@/lib/geo";
import { formatDateKey, formatTimestamp } from "@/lib/time";
import { fromDbTime } from "@/lib/booking";
import { AdminShell } from "@/components/admin/AdminShell";
import { VisitorBookedCard } from "@/components/admin/VisitorBookedCard";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { cn } from "@/lib/utils";
import {
  isInfrastructureReferrerHost,
  referrerSourceLabel,
} from "@/lib/attribution/constants";

export const dynamic = "force-dynamic";

export default async function VisitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const session = await getSessionById(id).catch(() => null);
  if (!session) notFound();

  const [bookedMarkers, linkedBookings, relatedSessions, bookedOverride] =
    await Promise.all([
      getBookedVisitorMarkers(),
      listBookingsForVisitor({ id: session.id, ip: session.ip }),
      listSessionsByVisitorId({
        visitorId: session.visitor_id,
        excludeSessionId: session.id,
        limit: 8,
      }),
      getSessionBookedOverride(session.id),
    ]);

  const sessionWithOverride = { ...session, booked_override: bookedOverride };
  const autoBooked = isVisitorBooked(
    { ...session, booked_override: null },
    {
      ...bookedMarkers,
      forcedBookedSessionIds: new Set(),
      forcedNotBookedSessionIds: new Set(),
    }
  );
  const booked = isVisitorBooked(sessionWithOverride, bookedMarkers);
  const location = describeLocation(session);
  const channel = acquisitionLabel(session.acquisition_channel);
  const strength = engagementStrength(
    session.event_count,
    Number(session.max_scroll_pct)
  );

  return (
    <AdminShell>
      <Link
        href="/admin/visitors"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        All visitors
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {location ?? session.ip ?? "Visitor"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.page} · {session.device} ·{" "}
            {formatTimestamp(session.started_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              booked
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                : "border-border text-muted-foreground"
            )}
          >
            {booked ? "Booked" : "Not booked"}
          </span>
          {bookedOverride != null ? (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              Manual
            </span>
          ) : null}
          {channel ? (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {channel}
            </span>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/heatmap/sessions/${session.id}`}>Replay</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Visit details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Location" value={location} />
            <Row label="IP" value={session.ip} />
            <Row label="City" value={session.city} />
            <Row label="Region" value={session.region} />
            <Row label="Country" value={session.country} />
            <Row label="Postal code" value={session.postal_code} />
            <Row
              label="Coordinates"
              value={
                session.latitude != null && session.longitude != null
                  ? `${session.latitude}, ${session.longitude}`
                  : null
              }
            />
            <Row label="Device" value={session.device} />
            <Row label="Page" value={session.page} />
            <Row label="Started" value={formatTimestamp(session.started_at)} />
            <Row label="Ended" value={formatTimestamp(session.ended_at)} />
            <Row label="Events" value={String(session.event_count)} />
            <Row
              label="Max scroll"
              value={`${Number(session.max_scroll_pct).toFixed(0)}%`}
            />
            <Row label="Session depth" value={SESSION_STRENGTH_LABELS[strength]} />
            <Row
              label="Viewport"
              value={`${session.viewport_w}×${session.viewport_h}`}
            />
            <Row label="Document height" value={`${session.document_h}px`} />
            <Row label="Bot" value={session.is_bot ? "Yes" : "No"} />
            <Row label="Visitor id" value={session.visitor_id} />
            <Row label="Session id" value={session.id} />
            <Row label="User agent" value={session.user_agent} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Traffic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Channel" value={channel ?? "Unknown"} />
            <Row label="Landing" value={session.landing_path} />
            <Row
              label="Source"
              value={referrerSourceLabel(
                session.referrer_host,
                session.utm_source
              )}
            />
            <Row label="Referrer host" value={isInfrastructureReferrerHost(session.referrer_host) ? null : session.referrer_host} />
            <Row label="Referrer" value={session.referrer} />
            <Row label="UTM source" value={session.utm_source} />
            <Row label="UTM medium" value={session.utm_medium} />
            <Row label="UTM campaign" value={session.utm_campaign} />
            <Row label="UTM content" value={session.utm_content} />
            <Row label="UTM term" value={session.utm_term} />
            <Row
              label="Google Ads click"
              value={
                session.gclid
                  ? `Yes (${session.gclid.slice(0, 12)}…)`
                  : session.acquisition_channel
                    ? "No"
                    : null
              }
            />
          </CardContent>
        </Card>

        <VisitorBookedCard
          sessionId={session.id}
          booked={booked}
          bookedOverride={bookedOverride}
          autoBooked={autoBooked}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Linked bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {linkedBookings.length === 0 ? (
              <p className="text-muted-foreground">
                No booking linked by session id or visitor IP.
              </p>
            ) : (
              linkedBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="block rounded-lg border border-border px-3 py-2 hover:border-primary"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {booking.customer_name ?? "No name"}
                    </span>
                    <span className="flex flex-wrap gap-1">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px]",
                          STATUS_TONE[booking.status]
                        )}
                      >
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px]",
                          PAYMENT_TONE[booking.payment_status]
                        )}
                      >
                        {PAYMENT_STATUS_LABELS[booking.payment_status]}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {formatDateKey(booking.booking_date, ADMIN_LOCALE)} ·{" "}
                    {fromDbTime(booking.booking_time)} ·{" "}
                    {SOURCE_LABELS[booking.source]}
                    {booking.analytics_session_id === session.id
                      ? " · session link"
                      : booking.visitor_ip === session.ip
                        ? " · IP link"
                        : ""}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {relatedSessions.length > 0 ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Other visits from this visitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {relatedSessions.map((related) => {
              const relatedBooked = isVisitorBooked(related, bookedMarkers);
              const relatedLocation = describeLocation(related);
              return (
                <Link
                  key={related.id}
                  href={`/admin/visitors/${related.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0 hover:text-primary"
                >
                  <span>
                    {relatedLocation ?? related.ip ?? related.page} ·{" "}
                    {related.device} · {related.page}
                  </span>
                  <span className="text-muted-foreground">
                    {relatedBooked ? "Booked" : "Not booked"} ·{" "}
                    {formatTimestamp(related.started_at)}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </AdminShell>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right">{value?.trim() || "—"}</span>
    </div>
  );
}
