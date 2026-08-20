"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DayPicker, type Matcher } from "react-day-picker";
import { addDays, startOfDay } from "date-fns";
import { sv, enGB } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import {
  BOOKING_HORIZON_DAYS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  formatBookingDate,
  getBookedTimesForDate,
  getFullyBookedDates,
  getTimeSlots,
  isBookableWeekday,
  isPastDate,
  toDateKey,
} from "@/lib/booking";
import { useMounted } from "@/lib/useMounted";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import "react-day-picker/style.css";

type BookingStatus = "idle" | "submitting" | "success" | "error";

export function BookingPicker() {
  const t = useTranslations("booking");
  const tContact = useTranslations("contact");
  const locale = useLocale();
  const mounted = useMounted();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  const timeSlots = getTimeSlots();
  const dateLocale = locale === "sv" ? sv : enGB;

  useEffect(() => {
    setRangeStart(startOfDay(new Date()));
  }, []);

  const rangeEnd = useMemo(
    () => (rangeStart ? addDays(rangeStart, BOOKING_HORIZON_DAYS) : null),
    [rangeStart]
  );
  const fromKey = useMemo(() => (rangeStart ? toDateKey(rangeStart) : null), [rangeStart]);
  const toKey = useMemo(() => (rangeEnd ? toDateKey(rangeEnd) : null), [rangeEnd]);

  const loadBookings = useCallback(async () => {
    if (!fromKey || !toKey) return false;

    try {
      const response = await fetch(`/api/bookings?from=${fromKey}&to=${toKey}`);
      const data = (await response.json()) as { slots?: string[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load bookings");
      }

      setBookedSlots(new Set(data.slots ?? []));
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("loadError"));
      return false;
    }
  }, [fromKey, toKey, t]);

  useEffect(() => {
    if (!fromKey || !toKey) return;

    let cancelled = false;

    async function init() {
      setSlotsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/bookings?from=${fromKey}&to=${toKey}`);
        const data = (await response.json()) as { slots?: string[]; error?: string };

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load bookings");
        }

        setBookedSlots(new Set(data.slots ?? []));
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : t("loadError"));
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
    // fromKey/toKey are stable for the session; t omitted to avoid re-fetch loops
  }, [fromKey, toKey]);

  const fullyBookedDates = useMemo(() => {
    if (!rangeStart || !rangeEnd) return [];
    return getFullyBookedDates(bookedSlots, rangeStart, rangeEnd);
  }, [bookedSlots, rangeEnd, rangeStart]);

  const disabledDays: Matcher[] = rangeStart && rangeEnd
    ? [
        { before: rangeStart },
        { after: rangeEnd },
        { dayOfWeek: [6] },
        ...fullyBookedDates,
      ]
    : [{ dayOfWeek: [0, 1, 2, 3, 4, 5, 6] }];

  const bookedTimesForSelected = selectedDate
    ? getBookedTimesForDate(bookedSlots, selectedDate)
    : new Set<string>();

  const detailsReady =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.replace(/\D/g, "").length >= 8 &&
    address.trim().length >= 8;

  const canSubmit =
    selectedDate &&
    selectedTime &&
    detailsReady &&
    isBookableWeekday(selectedDate) &&
    !isPastDate(selectedDate) &&
    !bookedTimesForSelected.has(selectedTime) &&
    status !== "submitting" &&
    !slotsLoading;

  async function handleBooking() {
    if (!selectedDate || !selectedTime || !detailsReady) return;

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: toDateKey(selectedDate),
          time: selectedTime,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          locale,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (response.status === 409) {
        setStatus("error");
        setErrorMessage(t("slotTaken"));
        await loadBookings();
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? t("bookingError"));
      }

      setStatus("success");
      setConfirmedEmail(email.trim());
      setSelectedTime(null);
      await loadBookings();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : t("bookingError"));
    }
  }

  return (
    <section id="booking" className="section-anchor py-24 sm:py-32">
      <Container>
        <div className="mb-12 max-w-2xl">
          <h2 className="headline-display text-4xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-text-secondary">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel rounded-3xl p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-beam">
              {t("selectDate")}
            </h3>
            <div className="booking-calendar mt-4 min-h-[280px]">
              {mounted && rangeStart ? (
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                    setErrorMessage(null);
                    if (status === "success") setStatus("idle");
                  }}
                  disabled={disabledDays}
                  locale={dateLocale}
                  weekStartsOn={1}
                  modifiers={{ fullyBooked: fullyBookedDates }}
                  modifiersClassNames={{
                    selected: "rdp-selected-custom",
                    today: "rdp-today-custom",
                    fullyBooked: "rdp-fully-booked",
                  }}
                />
              ) : (
                <div
                  className="flex h-full min-h-[280px] items-center justify-center rounded-xl border border-white/5 text-sm text-text-muted"
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="mt-3 text-xs text-text-muted">{t("availabilityNote")}</p>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-beam">
              {t("selectTime")}
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {timeSlots.map((slot) => {
                const noDate = !selectedDate;
                const invalidDay =
                  selectedDate &&
                  (!isBookableWeekday(selectedDate) || isPastDate(selectedDate));
                const isBooked = bookedTimesForSelected.has(slot);
                const disabled = noDate || invalidDay || isBooked || slotsLoading;
                const active = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={Boolean(disabled)}
                    onClick={() => {
                      setSelectedTime(slot);
                      setErrorMessage(null);
                      if (status === "success") setStatus("idle");
                    }}
                    aria-label={
                      isBooked ? t("slotBooked", { time: slot }) : slot
                    }
                    className={`min-h-11 rounded-xl border px-2 py-2 text-sm font-medium transition-colors ${
                      isBooked
                        ? "cursor-not-allowed border-white/5 bg-void-surface/40 text-text-muted line-through opacity-45"
                        : active
                          ? "cursor-pointer border-beam bg-beam font-semibold text-void"
                          : disabled
                            ? "cursor-not-allowed border-white/5 text-text-muted"
                            : "cursor-pointer border-white/10 text-text-secondary hover:border-beam hover:text-text-primary"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            {slotsLoading && (
              <p className="mt-3 text-xs text-text-muted">{t("loadingSlots")}</p>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-beam">
                {tContact("title")}
              </h3>
              <div className="mt-6 space-y-4">
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="block cursor-pointer rounded-2xl border border-white/10 bg-void-surface/60 px-4 py-4 transition-colors hover:border-beam"
                >
                  <span className="text-xs uppercase tracking-wider text-text-muted">
                    {tContact("call")}
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-beam">
                    {CONTACT_PHONE_DISPLAY}
                  </span>
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="block cursor-pointer rounded-2xl border border-white/10 bg-void-surface/60 px-4 py-4 transition-colors hover:border-beam"
                >
                  <span className="text-xs uppercase tracking-wider text-text-muted">
                    {tContact("emailAction")}
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-beam">
                    {CONTACT_EMAIL}
                  </span>
                </a>
              </div>
              <p className="mt-4 text-sm text-text-secondary">{tContact("area")}</p>
            </div>

            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-beam">
                {t("yourDetails")}
              </h3>
              <div className="mt-4 space-y-3">
                <label className="block text-xs text-text-muted">
                  {t("name")}
                  <input
                    className="booking-field mt-1"
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (status === "success") setStatus("idle");
                    }}
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  {t("email")}
                  <input
                    className="booking-field mt-1"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={120}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status === "success") setStatus("idle");
                    }}
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  {t("phone")}
                  <input
                    className="booking-field mt-1"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    maxLength={40}
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      if (status === "success") setStatus("idle");
                    }}
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  {t("address")}
                  <textarea
                    className="booking-field mt-1 min-h-20 resize-y"
                    name="address"
                    autoComplete="street-address"
                    required
                    maxLength={200}
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      if (status === "success") setStatus("idle");
                    }}
                  />
                </label>
              </div>

              <p className="mt-6 text-xs uppercase tracking-wider text-text-muted">{t("selected")}</p>
              <p className="mt-2 text-lg font-medium text-text-primary">
                {selectedDate && selectedTime
                  ? `${formatBookingDate(selectedDate, locale)} · ${selectedTime}`
                  : !selectedDate
                    ? t("noDate")
                    : t("noTime")}
              </p>

              {status === "success" && (
                <p
                  role="status"
                  className="mt-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
                >
                  {t("bookingSuccess", { email: confirmedEmail ?? email })}
                </p>
              )}

              {errorMessage && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-pulse/40 bg-pulse/10 px-4 py-3 text-sm text-pulse-hot"
                >
                  {errorMessage}
                </p>
              )}

              <Button
                className="mt-6 w-full"
                disabled={!canSubmit}
                onClick={() => void handleBooking()}
              >
                {status === "submitting" ? t("submitting") : t("requestBooking")}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
