"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DayPicker, type Matcher } from "react-day-picker";
import { sv, enGB } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import {
  DEFAULT_BOOKING_RULES,
  type AvailabilityMap,
  type BookingRules,
} from "@/lib/availability";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  digitsFromPostalCode,
  formatBookingDate,
  formatOre,
  formatSwedishPostalCode,
  isCompletePostalCode,
  isStockholmCountyPostalCode,
  parseDateKey,
  slotKey,
  toDateKey,
} from "@/lib/booking";
import { addDaysToDateKey, slotIsPast, stockholmDateKey, stockholmTime } from "@/lib/time";
import { useMounted } from "@/lib/useMounted";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import "react-day-picker/style.css";

type BookingStatus = "idle" | "submitting" | "error";

type BookingsResponse = {
  slots?: string[];
  availability?: AvailabilityMap;
  rules?: BookingRules;
  error?: string;
};

export function BookingPicker() {
  const t = useTranslations("booking");
  const tContact = useTranslations("contact");
  const locale = useLocale();
  const mounted = useMounted();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [rules, setRules] = useState<BookingRules>(DEFAULT_BOOKING_RULES);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postalTouched, setPostalTouched] = useState(false);
  const [withdrawalConsent, setWithdrawalConsent] = useState(false);

  const dateLocale = locale === "sv" ? sv : enGB;

  // Derived rather than stored: today's date differs between the server render
  // and the client, so it can only be read once the component has mounted.
  const today = mounted ? toDateKey(new Date()) : null;

  const horizonKey = useMemo(
    () => (today ? addDaysToDateKey(today, rules.horizonDays) : null),
    [today, rules.horizonDays]
  );

  const loadBookings = useCallback(async () => {
    if (!today || !horizonKey) return false;

    try {
      const response = await fetch(
        `/api/bookings?from=${today}&to=${horizonKey}`
      );
      const data = (await response.json()) as BookingsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load bookings");
      }

      setBookedSlots(new Set(data.slots ?? []));
      if (data.availability) setAvailability(data.availability);
      if (data.rules) setRules(data.rules);
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("loadError"));
      return false;
    }
  }, [today, horizonKey, t]);

  // Stripe sends the customer back here with a marker on the URL. Derived
  // rather than stored so the banner survives the cleanup below.
  const stripeOutcome = useMemo<"paid" | "cancelled" | null>(() => {
    if (!mounted) return null;
    const value = new URLSearchParams(window.location.search).get("booking");
    return value === "paid" || value === "cancelled" ? value : null;
  }, [mounted]);

  // Drop the marker so a refresh does not resurrect the banner.
  useEffect(() => {
    if (!stripeOutcome) return;

    const params = new URLSearchParams(window.location.search);
    params.delete("booking");
    params.delete("session_id");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}#booking`
    );
  }, [stripeOutcome]);

  useEffect(() => {
    if (!today || !horizonKey) return;

    let cancelled = false;

    async function init() {
      setSlotsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/bookings?from=${today}&to=${horizonKey}`
        );
        const data = (await response.json()) as BookingsResponse;

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load bookings");
        }

        setBookedSlots(new Set(data.slots ?? []));
        setAvailability(data.availability ?? {});
        if (data.rules) setRules(data.rules);
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
    // today/horizonKey are stable for the session; t omitted to avoid re-fetch loops
  }, [today, horizonKey]);

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;

  /** Open slots for the selected day, driven by the server's availability map. */
  const openTimes = useMemo(
    () => (selectedKey ? (availability[selectedKey] ?? []) : []),
    [availability, selectedKey]
  );

  /** Fixed 08:00–20:00 grid so every hour is visible regardless of the day's schedule. */
  const displayTimes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const hour = 8 + index;
        return `${String(hour).padStart(2, "0")}:00`;
      }),
    []
  );

  const nowDate = mounted ? stockholmDateKey() : null;
  const nowTime = mounted ? stockholmTime() : null;

  /** Days with no open slots at all, or where every open slot is taken. */
  const closedDates = useMemo(() => {
    if (!today || !horizonKey) return [];

    const closed: Date[] = [];
    let cursor = today;

    for (let i = 0; i <= 400 && cursor <= horizonKey; i++) {
      const times = availability[cursor];
      const allTaken =
        !times ||
        times.length === 0 ||
        times.every((time) => bookedSlots.has(slotKey(cursor, time)));

      if (allTaken) closed.push(parseDateKey(cursor));
      cursor = addDaysToDateKey(cursor, 1);
    }

    return closed;
  }, [availability, bookedSlots, today, horizonKey]);

  const disabledDays: Matcher[] =
    today && horizonKey
      ? [
          { before: parseDateKey(today) },
          { after: parseDateKey(horizonKey) },
          ...closedDates,
        ]
      : [{ dayOfWeek: [0, 1, 2, 3, 4, 5, 6] }];

  const postalInArea = isStockholmCountyPostalCode(postalCode);
  const postalInvalidFormat =
    postalTouched &&
    postalCode.trim().length > 0 &&
    !isCompletePostalCode(postalCode);
  const showOutOfArea = isCompletePostalCode(postalCode) && !postalInArea;

  const detailsReady =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.replace(/\D/g, "").length >= 8 &&
    address.trim().length >= 8 &&
    postalInArea;

  const canSubmit = Boolean(
    selectedKey &&
      selectedTime &&
      detailsReady &&
      withdrawalConsent &&
      openTimes.includes(selectedTime) &&
      !bookedSlots.has(slotKey(selectedKey, selectedTime)) &&
      !(nowDate && nowTime && slotIsPast(selectedKey, selectedTime, nowDate, nowTime)) &&
      status !== "submitting" &&
      !slotsLoading
  );

  async function handleBooking() {
    if (!selectedKey || !selectedTime || !detailsReady) return;

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedKey,
          time: selectedTime,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          postalCode: formatSwedishPostalCode(postalCode),
          locale,
          withdrawalConsent,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        checkoutUrl?: string;
      };

      if (response.status === 409) {
        setStatus("error");
        setErrorMessage(t("slotTaken"));
        await loadBookings();
        return;
      }

      if (response.status === 422 || data.error === "OUT_OF_SERVICE_AREA") {
        setStatus("error");
        setErrorMessage(t("outOfArea"));
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? t("bookingError"));
      }

      if (!data.checkoutUrl) {
        throw new Error(t("bookingError"));
      }

      // A plain navigation rather than a form post, so the site's
      // `form-action 'self'` CSP needs no exception for Stripe.
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : t("bookingError")
      );
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
              {mounted && today ? (
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                    setErrorMessage(null);
                  }}
                  disabled={disabledDays}
                  locale={dateLocale}
                  weekStartsOn={1}
                  modifiers={{ fullyBooked: closedDates }}
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
            <p className="mt-3 text-xs text-text-muted">
              {t("availabilityNote")}
            </p>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-beam">
              {t("selectTime")}
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {displayTimes.map((slot) => {
                const isOpen = openTimes.includes(slot);
                const isBooked = Boolean(
                  selectedKey && bookedSlots.has(slotKey(selectedKey, slot))
                );
                const isPast = Boolean(
                  selectedKey &&
                    nowDate &&
                    nowTime &&
                    slotIsPast(selectedKey, slot, nowDate, nowTime)
                );
                const isUnavailable =
                  Boolean(selectedKey) && (isPast || !isOpen || isBooked);
                const disabled =
                  !selectedKey || isUnavailable || slotsLoading;
                const active = selectedTime === slot && !isUnavailable;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setSelectedTime(slot);
                      setErrorMessage(null);
                    }}
                    aria-label={isBooked ? t("slotBooked", { time: slot }) : slot}
                    className={`min-h-11 rounded-xl border px-2 py-2 text-sm font-medium transition-colors ${
                      isUnavailable
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
              <p className="mt-4 text-sm text-text-secondary">
                {tContact("area")}
              </p>
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
                    }}
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  {t("postalCode")}
                  <input
                    className="booking-field mt-1"
                    type="text"
                    name="postal-code"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    maxLength={6}
                    placeholder={t("postalCodePlaceholder")}
                    value={postalCode}
                    aria-invalid={showOutOfArea || postalInvalidFormat}
                    aria-describedby={
                      showOutOfArea
                        ? "booking-postal-out-of-area"
                        : postalInvalidFormat
                          ? "booking-postal-invalid"
                          : undefined
                    }
                    onChange={(event) => {
                      const next = event.target.value.replace(/[^\d\s]/g, "");
                      setPostalCode(next);
                    }}
                    onBlur={() => {
                      setPostalTouched(true);
                      const digits = digitsFromPostalCode(postalCode);
                      if (digits.length === 5) {
                        setPostalCode(formatSwedishPostalCode(digits));
                      }
                    }}
                  />
                </label>
                {showOutOfArea && (
                  <p
                    id="booking-postal-out-of-area"
                    role="alert"
                    className="text-sm font-medium text-pulse-hot"
                  >
                    {t("outOfArea")}
                  </p>
                )}
                {postalInvalidFormat && (
                  <p
                    id="booking-postal-invalid"
                    role="alert"
                    className="text-sm font-medium text-pulse-hot"
                  >
                    {t("invalidPostalCode")}
                  </p>
                )}
              </div>

              <fieldset className="mt-6">
                <legend className="text-xs uppercase tracking-wider text-text-muted">
                  {t("paymentTitle")}
                </legend>
                <div className="mt-3 rounded-2xl border border-beam/40 bg-beam/5 px-4 py-3">
                  <p className="text-sm font-semibold text-text-primary">
                    {t("payNow", { price: formatOre(rules.priceOre) })}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {t("payNowHint")}
                  </p>
                </div>

                <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-[var(--beam)]"
                    checked={withdrawalConsent}
                    onChange={(event) => {
                      setWithdrawalConsent(event.target.checked);
                      setErrorMessage(null);
                    }}
                  />
                  <span>{t("withdrawalConsent")}</span>
                </label>
              </fieldset>

              <p className="mt-6 text-xs uppercase tracking-wider text-text-muted">
                {t("selected")}
              </p>
              <p className="mt-2 text-lg font-medium text-text-primary">
                {selectedDate && selectedTime
                  ? `${formatBookingDate(selectedDate, locale)} · ${selectedTime}`
                  : !selectedDate
                    ? t("noDate")
                    : t("noTime")}
              </p>

              {stripeOutcome === "paid" && (
                <p
                  role="status"
                  className="mt-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
                >
                  {t("bookingSuccess")}
                </p>
              )}

              {(errorMessage ?? stripeOutcome === "cancelled") && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-pulse/40 bg-pulse/10 px-4 py-3 text-sm text-pulse-hot"
                >
                  {errorMessage ?? t("paymentCancelled")}
                </p>
              )}

              <Button
                className="mt-6 w-full"
                disabled={!canSubmit}
                onClick={() => void handleBooking()}
              >
                {status === "submitting"
                  ? t("submitting")
                  : t("continueToPayment")}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
