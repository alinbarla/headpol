import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  HashIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ReceiptIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PendingPaymentPoller } from "@/components/booking/PendingPaymentPoller";
import { PurchaseConversion } from "@/components/analytics/GoogleTag";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { BookingConfirmation } from "@/lib/bookingConfirmation";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  formatBookingDate,
  formatOre,
  parseDateKey,
} from "@/lib/booking";

type Props = {
  locale: string;
  confirmation: BookingConfirmation | null;
};

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export async function BookingConfirmationView({
  locale,
  confirmation,
}: Props) {
  const t = await getTranslations({ locale, namespace: "bookingConfirmation" });
  const steps = t.raw("nextSteps") as Array<{
    title: string;
    description: string;
  }>;

  const paid = confirmation?.paid === true;
  const pending = Boolean(confirmation && !confirmation.paid);

  const title = !confirmation
    ? t("titleMissing")
    : paid
      ? firstName(confirmation.name)
        ? t("titlePaid", { name: firstName(confirmation.name) })
        : t("titlePaidGeneric")
      : t("titlePending");

  const lead = !confirmation
    ? t("leadMissing")
    : paid
      ? t("leadPaid", { email: confirmation.email })
      : t("leadPending", { email: confirmation.email });

  return (
    <main className="relative overflow-hidden py-16 sm:py-24">
      {paid && confirmation ? (
        <PurchaseConversion transactionId={confirmation.id} />
      ) : null}
      {pending ? <PendingPaymentPoller /> : null}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(255,243,38,0.12),transparent_65%)]"
        aria-hidden="true"
      />

      <Container className="relative max-w-3xl">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-beam"
        >
          <ArrowLeftIcon className="size-4" />
          {t("back")}
        </Link>

        <div className="mt-8 flex items-start gap-4">
          <StatusMark paid={paid} missing={!confirmation} />
          <div>
            {confirmation ? (
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  paid ? "text-success" : "text-beam"
                }`}
              >
                {paid ? t("badgePaid") : t("badgePending")}
              </p>
            ) : null}
            <h1 className="headline-display mt-2 text-3xl font-bold text-text-primary sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              {lead}
            </p>
          </div>
        </div>

        {confirmation ? (
          <section
            className="glass-panel mt-10 rounded-3xl p-6 sm:p-8"
            aria-labelledby="booking-details-heading"
          >
            <h2
              id="booking-details-heading"
              className="text-sm font-semibold uppercase tracking-wider text-beam"
            >
              {t("detailsTitle")}
            </h2>

            <dl className="mt-6 divide-y divide-white/10">
              <Detail
                icon={SparklesIcon}
                label={t("serviceLabel")}
                value={t("serviceValue")}
              />
              <Detail
                icon={CalendarClockIcon}
                label={t("whenLabel")}
                value={`${formatBookingDate(parseDateKey(confirmation.date), locale)} · ${confirmation.time}`}
                hint={t("durationNote")}
              />
              <Detail
                icon={MapPinIcon}
                label={t("whereLabel")}
                value={confirmation.address}
              />
              <Detail
                icon={UserIcon}
                label={t("contactLabel")}
                value={[
                  confirmation.name,
                  confirmation.email,
                  confirmation.phone,
                ]
                  .filter(Boolean)
                  .join("\n")}
                hint={t("contactNote")}
              />
              <Detail
                icon={ReceiptIcon}
                label={paid ? t("paidLabel") : t("pendingAmountLabel")}
                value={formatOre(confirmation.amountOre)}
                hint={t("vatNote", {
                  vat: formatOre(Math.round(confirmation.amountOre * 0.2)),
                })}
                emphasize
              />
              <Detail
                icon={HashIcon}
                label={t("referenceLabel")}
                value={confirmation.reference}
              />
            </dl>
          </section>
        ) : null}

        {paid ? (
          <section className="mt-8" aria-labelledby="next-heading">
            <h2
              id="next-heading"
              className="headline-display text-2xl font-bold text-text-primary"
            >
              {t("nextTitle")}
            </h2>
            <ol className="mt-5 grid gap-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-white/5 bg-void-elevated px-4 py-4"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-beam/15 text-sm font-bold text-beam">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="mt-8 rounded-3xl border border-white/5 bg-void-elevated p-6 sm:p-8">
          <h2 className="headline-display text-xl font-bold text-text-primary">
            {t("changeTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {t("changeBody", {
              phone: CONTACT_PHONE_DISPLAY,
              email: CONTACT_EMAIL,
            })}
          </p>
          <p className="mt-2 text-sm">
            <Link
              href={`/${locale}/villkor`}
              className="text-beam underline-offset-2 hover:underline"
            >
              {t("termsLink")}
            </Link>
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={`tel:${CONTACT_PHONE}`} className="sm:flex-1">
              <PhoneIcon className="mr-2 size-4" />
              {t("callCta", { phone: CONTACT_PHONE_DISPLAY })}
            </Button>
            <Button
              href={`mailto:${CONTACT_EMAIL}`}
              variant="outline"
              className="sm:flex-1"
            >
              <MailIcon className="mr-2 size-4" />
              {CONTACT_EMAIL}
            </Button>
          </div>
          <Button
            href={`/${locale}`}
            variant="ghost"
            className="mt-3 w-full text-text-secondary"
          >
            {t("homeCta")}
          </Button>
        </section>
      </Container>
    </main>
  );
}

function StatusMark({
  paid,
  missing,
}: {
  paid: boolean;
  missing: boolean;
}) {
  const Icon = missing
    ? CircleAlertIcon
    : paid
      ? CircleCheckIcon
      : CalendarClockIcon;
  const tone = missing
    ? "bg-pulse/15 text-pulse-hot"
    : paid
      ? "bg-success/15 text-success"
      : "bg-beam/15 text-beam";

  return (
    <span
      className={`flex size-12 shrink-0 items-center justify-center rounded-full sm:size-14 ${tone}`}
      aria-hidden="true"
    >
      <Icon className="size-6 sm:size-7" />
    </span>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  hint,
  emphasize = false,
}: {
  icon: typeof SparklesIcon;
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 size-5 shrink-0 text-beam" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wider text-text-muted">
          {label}
        </dt>
        <dd
          className={`mt-1 whitespace-pre-line ${
            emphasize
              ? "headline-display text-2xl font-bold text-beam"
              : "text-base font-medium text-text-primary"
          }`}
        >
          {value}
        </dd>
        {hint ? (
          <p className="mt-1 text-xs text-text-muted">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
