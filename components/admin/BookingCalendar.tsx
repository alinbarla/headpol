"use client";

import { Fragment, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { toast } from "sonner";
import { rescheduleBooking } from "@/app/admin/actions";
import {
  calendarJobLabel,
  calendarJobTone,
  PAYMENT_STATUS_LABELS,
  SOURCE_LABELS,
} from "@/lib/admin/labels";
import {
  openSlotsForDate,
  type AvailabilityOverride,
  type BookingRules,
} from "@/lib/availability";
import { ADMIN_INTL_LOCALE, ADMIN_LOCALE } from "@/lib/admin/labels";
import { formatOre, fromDbTime } from "@/lib/booking";
import { addDaysToDateKey, formatDateKey, slotIsPast, stockholmDateKey, stockholmTime, weekdayForDateKey } from "@/lib/time";
import type { BookingRecord } from "@/lib/supabase/server";
import { Button } from "@/components/shadcn/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { cn } from "@/lib/utils";

type View = "month" | "week" | "day";

type PendingMove = {
  booking: BookingRecord;
  date: string;
  time: string;
};

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Forked from a generic event manager and reworked for bookings: it is fully
 * controlled by server data (no local event state to drift out of sync),
 * Monday-first, and its hour grid is clamped to the working day instead
 * of rendering all 24 hours.
 */
export function BookingCalendar({
  bookings,
  overrides,
  rules,
  anchorDate,
  anchorTime,
}: {
  bookings: BookingRecord[];
  overrides: AvailabilityOverride[];
  rules: BookingRules;
  anchorDate: string;
  /** Stockholm `HH:MM` when the page was rendered. */
  anchorTime: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(anchorDate);
  const [pending, setPending] = useState<PendingMove | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [isMoving, startMove] = useTransition();
  const [nowDate, setNowDate] = useState(anchorDate);
  const [nowTime, setNowTime] = useState(anchorTime);

  useEffect(() => {
    const tick = () => {
      setNowDate(stockholmDateKey());
      setNowTime(stockholmTime());
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Keyed by `YYYY-MM-DDTHH:MM` so the grid can look up a cell in O(1).
  const bySlot = useMemo(() => {
    const map = new Map<string, BookingRecord>();
    for (const booking of bookings) {
      map.set(`${booking.booking_date}T${fromDbTime(booking.booking_time)}`, booking);
    }
    return map;
  }, [bookings]);

  const byDate = useMemo(() => {
    const map = new Map<string, BookingRecord[]>();
    for (const booking of bookings) {
      const list = map.get(booking.booking_date) ?? [];
      list.push(booking);
      map.set(booking.booking_date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.booking_time.localeCompare(b.booking_time));
    }
    return map;
  }, [bookings]);

  /**
   * The grid spans one hour either side of the widest configured window, so a
   * booking squeezed in outside opening hours is still visible.
   */
  const hours = useMemo(() => {
    let min = rules.startHour;
    let max = rules.endHour;

    for (const booking of bookings) {
      const hour = Number(booking.booking_time.slice(0, 2));
      if (hour < min) min = hour;
      if (hour + 1 > max) max = hour + 1;
    }

    const from = Math.max(0, min - 1);
    const to = Math.min(24, max + 1);
    return Array.from({ length: to - from }, (_, index) => from + index);
  }, [bookings, rules.startHour, rules.endHour]);

  // Overrides are pre-grouped by date so each cell lookup stays cheap without
  // a memoising cache that would have to be mutated during render.
  const overridesByDate = useMemo(() => {
    const map = new Map<string, AvailabilityOverride[]>();
    for (const override of overrides) {
      const list = map.get(override.override_date) ?? [];
      list.push(override);
      map.set(override.override_date, list);
    }
    return map;
  }, [overrides]);

  const openSlotCache = useCallback(
    (dateKey: string) =>
      openSlotsForDate(dateKey, rules, overridesByDate.get(dateKey) ?? []),
    [rules, overridesByDate]
  );

  function shift(direction: 1 | -1) {
    const step = view === "month" ? 0 : view === "week" ? 7 : 1;
    if (step === 0) {
      const [year, month] = cursor.split("-").map(Number);
      const next = new Date(Date.UTC(year, month - 1 + direction, 1, 12));
      setCursor(
        `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`
      );
      return;
    }
    setCursor(addDaysToDateKey(cursor, step * direction));
  }

  function requestMove(booking: BookingRecord, date: string, time: string) {
    if (booking.booking_date === date && fromDbTime(booking.booking_time) === time) {
      return;
    }
    setPending({ booking, date, time });
  }

  function confirmMove() {
    if (!pending) return;
    const move = pending;
    setPending(null);

    startMove(async () => {
      const result = await rescheduleBooking({
        id: move.booking.id,
        date: move.date,
        time: move.time,
        notify: true,
      });

      if (result.ok) {
        toast.success(result.message ?? "Booking moved");
        // Server data is the single source of truth, so refetch rather than
        // patching a local copy.
        router.refresh();
      } else {
        toast.error(result.message ?? "Could not move the booking");
      }
    });
  }

  return (
    <div className={cn(isMoving && "pointer-events-none opacity-60")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => shift(-1)}
            aria-label="Previous"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => shift(1)}
            aria-label="Next"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCursor(anchorDate)}
          >
            Today
          </Button>
          <span className="ml-2 text-sm font-medium">
            {rangeLabel(view, cursor)}
          </span>
        </div>

        <Tabs value={view} onValueChange={(value) => setView(value as View)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4">
        {view === "month" && (
          <MonthView
            cursor={cursor}
            byDate={byDate}
            openSlots={openSlotCache}
            nowDate={nowDate}
            onSelectDay={(dateKey) => {
              setCursor(dateKey);
              setView("day");
            }}
          />
        )}

        {view !== "month" && (
          <TimeGrid
            days={
              view === "week"
                ? weekDays(cursor)
                : [cursor]
            }
            hours={hours}
            bySlot={bySlot}
            openSlots={openSlotCache}
            dragging={dragging}
            nowDate={nowDate}
            nowTime={nowTime}
            onDragStart={setDragging}
            onDragEnd={() => setDragging(null)}
            onDrop={requestMove}
            bookings={bookings}
          />
        )}
      </div>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && (
                <>
                  {pending.booking.customer_name ?? "This booking"} moves from{" "}
                  {formatDateKey(pending.booking.booking_date, ADMIN_LOCALE)} at{" "}
                  {fromDbTime(pending.booking.booking_time)} to{" "}
                  {formatDateKey(pending.date, ADMIN_LOCALE)} at {pending.time}.
                  The customer gets an email about the change.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMove}>
              Move booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TimeGrid({
  days,
  hours,
  bySlot,
  openSlots,
  dragging,
  nowDate,
  nowTime,
  onDragStart,
  onDragEnd,
  onDrop,
  bookings,
}: {
  days: string[];
  hours: number[];
  bySlot: Map<string, BookingRecord>;
  openSlots: (dateKey: string) => string[];
  dragging: string | null;
  nowDate: string;
  nowTime: string;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (booking: BookingRecord, date: string, time: string) => void;
  bookings: BookingRecord[];
}) {
  const byId = useMemo(() => {
    const map = new Map<string, BookingRecord>();
    for (const booking of bookings) map.set(booking.id, booking);
    return map;
  }, [bookings]);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <div
        className="grid min-w-[640px]"
        style={{
          gridTemplateColumns: `4rem repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="border-b border-border bg-card" />
        {days.map((dateKey) => {
          const closed = openSlots(dateKey).length === 0;
          return (
            <div
              key={dateKey}
              className={cn(
                "border-b border-l border-border bg-card px-2 py-2 text-center",
                closed && "bg-secondary/40"
              )}
            >
              <p className="text-xs uppercase text-muted-foreground">
                {WEEKDAY_SHORT[(weekdayForDateKey(dateKey) + 6) % 7]}
              </p>
              <p className="text-sm font-semibold tabular-nums">
                {dateKey.slice(8)}/{dateKey.slice(5, 7)}
              </p>
            </div>
          );
        })}

        {hours.map((hour) => {
          const time = `${String(hour).padStart(2, "0")}:00`;

          return (
            // The key belongs on the fragment itself. Putting it on an inner
            // child, as the original did, warns on every render.
            <Fragment key={time}>
              <div className="border-b border-border px-2 py-3 text-right text-xs tabular-nums text-muted-foreground">
                {time}
              </div>

              {days.map((dateKey) => {
                const booking = bySlot.get(`${dateKey}T${time}`);
                const isOpen = openSlots(dateKey).includes(time);
                const passed = slotIsPast(dateKey, time, nowDate, nowTime);

                return (
                  <div
                    key={`${dateKey}T${time}`}
                    onDragOver={(event) => {
                      if (dragging) event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (!dragging) return;
                      const dragged = byId.get(dragging);
                      onDragEnd();
                      if (dragged) onDrop(dragged, dateKey, time);
                    }}
                    className={cn(
                      "min-h-16 border-b border-l border-border p-1 transition-colors",
                      !isOpen && !passed && "bg-secondary/30",
                      passed && "bg-zinc-900/80",
                      dragging && !booking && "hover:bg-primary/10"
                    )}
                  >
                    {booking && (
                      <BookingBlock
                        booking={booking}
                        onDragStart={() => onDragStart(booking.id)}
                        onDragEnd={onDragEnd}
                      />
                    )}
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function BookingBlock({
  booking,
  onDragStart,
  onDragEnd,
}: {
  booking: BookingRecord;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <Link
      href={`/admin/bookings/${booking.id}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title={`${booking.customer_name ?? ""} · ${calendarJobLabel(
        booking
      )} · ${PAYMENT_STATUS_LABELS[booking.payment_status]} · ${formatOre(
        booking.price_ore
      )} · ${SOURCE_LABELS[booking.source]}`}
      className={cn(
        "block h-full cursor-grab rounded-md border px-1.5 py-1 text-[11px] leading-tight active:cursor-grabbing",
        calendarJobTone(booking)
      )}
    >
      <span className="block truncate font-medium">
        {booking.customer_name ?? "No name"}
      </span>
      <span className="block truncate opacity-80">
        {calendarJobLabel(booking)}
      </span>
    </Link>
  );
}

function MonthView({
  cursor,
  byDate,
  openSlots,
  nowDate,
  onSelectDay,
}: {
  cursor: string;
  byDate: Map<string, BookingRecord[]>;
  openSlots: (dateKey: string) => string[];
  nowDate: string;
  onSelectDay: (dateKey: string) => void;
}) {
  const month = cursor.slice(0, 7);
  const gridStart = startOfWeekKey(`${month}-01`);

  // Six rows always, so the grid height does not jump between months.
  const days = Array.from({ length: 42 }, (_, index) =>
    addDaysToDateKey(gridStart, index)
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-7 bg-card">
        {WEEKDAY_SHORT.map((label) => (
          <div
            key={label}
            className="border-b border-border py-2 text-center text-xs uppercase text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((dateKey) => {
          const inMonth = dateKey.slice(0, 7) === month;
          const dayBookings = byDate.get(dateKey) ?? [];
          const closed = openSlots(dateKey).length === 0;
          const passed = dateKey < nowDate;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDay(dateKey)}
              className={cn(
                "min-h-24 border-b border-l border-border p-1.5 text-left align-top transition-colors hover:bg-secondary/50",
                !inMonth && "opacity-35",
                closed && !passed && "bg-secondary/30",
                passed && "bg-zinc-900/80"
              )}
            >
              <span className="text-xs font-medium tabular-nums">
                {Number(dateKey.slice(8))}
              </span>
              <span className="mt-1 block space-y-0.5">
                {dayBookings.slice(0, 3).map((booking) => (
                  <span
                    key={booking.id}
                    className={cn(
                      "block truncate rounded border px-1 text-[10px]",
                      calendarJobTone(booking)
                    )}
                  >
                    {fromDbTime(booking.booking_time)}{" "}
                    {booking.customer_name ?? ""}
                    {" · "}
                    {calendarJobLabel(booking)}
                  </span>
                ))}
                {dayBookings.length > 3 && (
                  <span className="block text-[10px] text-muted-foreground">
                    +{dayBookings.length - 3} more
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Monday-first start of week. The original computed
 * `startOfWeek.setDate(currentDate.getDay())`, which sets the day-of-month to
 * the weekday index and renders a completely unrelated week.
 */
function startOfWeekKey(dateKey: string): string {
  const weekday = weekdayForDateKey(dateKey);
  const offset = (weekday + 6) % 7;
  return addDaysToDateKey(dateKey, -offset);
}

function weekDays(cursor: string): string[] {
  const start = startOfWeekKey(cursor);
  return Array.from({ length: 7 }, (_, index) =>
    addDaysToDateKey(start, index)
  );
}

function rangeLabel(view: View, cursor: string): string {
  if (view === "day") return formatDateKey(cursor, ADMIN_LOCALE);

  if (view === "week") {
    const start = startOfWeekKey(cursor);
    const end = addDaysToDateKey(start, 6);
    return `${start} – ${end}`;
  }

  const [year, month] = cursor.split("-").map(Number);
  return new Intl.DateTimeFormat(ADMIN_INTL_LOCALE, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1, 12)));
}
