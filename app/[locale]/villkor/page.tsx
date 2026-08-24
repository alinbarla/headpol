import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/layout/LegalPage";
import { Footer } from "@/components/layout/Footer";
import {
  BOOKING_PRICE,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
} from "@/lib/booking";
import { routing, type Locale } from "@/lib/i18n";
import { BRAND, SITE_URL } from "@/lib/seo";

const UPDATED = "2026-08-24";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sv = locale === "sv";

  return {
    title: sv ? "Villkor och avbokning" : "Terms and cancellation",
    description: sv
      ? `Bokningsvillkor, avbokningsregler och ångerrätt hos ${BRAND}.`
      : `Booking terms, cancellation rules and the right of withdrawal at ${BRAND}.`,
    alternates: { canonical: `${SITE_URL}/${locale}/villkor` },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      {locale === "en" ? <TermsEn /> : <TermsSv />}
      <Footer />
    </>
  );
}

function TermsSv() {
  return (
    <LegalPage
      locale="sv"
      title="Villkor och avbokning"
      updated={`Senast uppdaterad ${UPDATED}`}
    >
      <h2>Tjänsten</h2>
      <p>
        {BRAND} utför strålkastarpolering på plats hos dig inom Stockholms län.
        Priset är {BOOKING_PRICE} inklusive moms för ett par strålkastare, om
        inget annat avtalats. Ett besök tar normalt omkring en timme.
      </p>

      <h2>Bokning</h2>
      <p>
        En bokning är bindande när du fått en bekräftelse via e-post. Vi behöver
        att bilen står tillgänglig utomhus på den adress du angett vid den
        bokade tiden.
      </p>

      <h2>Avbokning och ombokning</h2>
      <ul>
        <li>
          Avbokning eller ombokning senast 24 timmar före bokad tid är
          kostnadsfri. Har du betalat i förväg återbetalas hela beloppet.
        </li>
        <li>
          Vid avbokning senare än 24 timmar före besöket, eller om vi inte
          kommer åt bilen på plats, kan vi debitera halva priset för den
          bokade tiden.
        </li>
        <li>
          Om vi behöver flytta din tid, till exempel på grund av väder eller
          sjukdom, hör vi av oss så snart vi kan och erbjuder en ny tid eller
          full återbetalning.
        </li>
      </ul>
      <p>
        Avboka enklast genom att svara på bekräftelsemejlet eller ringa{" "}
        {CONTACT_PHONE_DISPLAY}.
      </p>

      <h2>Ångerrätt vid distansköp</h2>
      <p>
        När du bokar och betalar via webbplatsen har du enligt lagen om
        distansavtal och avtal utanför affärslokaler (2005:59) rätt att ångra
        köpet inom 14 dagar från det att avtalet ingicks.
      </p>
      <p>
        Om du vill att arbetet ska utföras före ångerfristens slut behöver du
        uttryckligen godkänna det, vilket du gör med kryssrutan i kassan.
        Ångerrätten upphör när tjänsten är fullgjord. Om du ångrar dig efter att
        arbetet påbörjats men innan det är klart, får vi ta betalt för den del
        som redan utförts.
      </p>
      <p>
        Använd gärna Konsumentverkets standardformulär för att utöva ångerrätten,
        eller meddela oss på {CONTACT_EMAIL}.
      </p>

      <h2>Betalning</h2>
      <p>
        Bokningar via webbplatsen betalas i förväg med kort eller Swish via vår
        betalpartner Stripe. Din tid hålls i 20 minuter medan du slutför
        betalningen, och bokningen bekräftas först när betalningen är genomförd.
        Bokar du per telefon skickar vi en betallänk. Alla priser är inklusive
        25 % moms.
      </p>

      <h2>Reklamation</h2>
      <p>
        Är du inte nöjd med resultatet, hör av dig inom skälig tid så gör vi om
        arbetet eller återbetalar. Du har enligt konsumenttjänstlagen rätt att
        reklamera fel i tjänsten i upp till tre år.
      </p>

      <h2>Tvist</h2>
      <p>
        Kommer vi inte överens kan du vända dig till Allmänna
        reklamationsnämnden (ARN) eller EU:s onlineplattform för
        tvistlösning. Vi följer ARN:s rekommendationer.
      </p>

      <h2>Kontakt</h2>
      <p>
        {BRAND}
        <br />
        {CONTACT_EMAIL}
        <br />
        {CONTACT_PHONE_DISPLAY}
      </p>
    </LegalPage>
  );
}

function TermsEn() {
  return (
    <LegalPage
      locale="en"
      title="Terms and cancellation"
      updated={`Last updated ${UPDATED}`}
    >
      <h2>The service</h2>
      <p>
        {BRAND} restores headlights at your address within Stockholm County.
        The price is 799 kr including VAT for a pair of headlights unless
        otherwise agreed. A visit normally takes about an hour.
      </p>

      <h2>Booking</h2>
      <p>
        A booking is binding once you receive an email confirmation. The car
        needs to be accessible outdoors at the address you gave, at the booked
        time.
      </p>

      <h2>Cancellation and rescheduling</h2>
      <ul>
        <li>
          Cancelling or rescheduling at least 24 hours before the booked time is
          free. If you paid in advance, you get a full refund.
        </li>
        <li>
          For cancellations later than 24 hours before the visit, or if we
          cannot reach the car on arrival, we may charge half the price of the
          booked slot.
        </li>
        <li>
          If we need to move your slot, for example because of weather or
          illness, we contact you as soon as we can and offer a new time or a
          full refund.
        </li>
      </ul>
      <p>
        The easiest way to cancel is to reply to the confirmation email or call{" "}
        {CONTACT_PHONE_DISPLAY}.
      </p>

      <h2>Right of withdrawal for distance purchases</h2>
      <p>
        When you book and pay through the website, the Swedish Distance
        Contracts Act (2005:59) gives you 14 days from the day the contract was
        entered into to withdraw from the purchase.
      </p>
      <p>
        If you want the work carried out before that period ends, you must
        explicitly agree to it, which you do with the checkbox at checkout. The
        right of withdrawal lapses once the service has been fully performed. If
        you withdraw after the work has started but before it is finished, we
        may charge for the part already carried out.
      </p>
      <p>
        You may use the Swedish Consumer Agency&apos;s standard withdrawal form,
        or simply notify us at {CONTACT_EMAIL}.
      </p>

      <h2>Payment</h2>
      <p>
        Bookings made through the website are paid in advance by card or Swish
        through our payment provider Stripe. Your slot is held for 20 minutes
        while you complete the payment, and the booking is confirmed only once
        the payment goes through. If you book by phone we send you a payment
        link. All prices include 25% Swedish VAT.
      </p>

      <h2>Complaints</h2>
      <p>
        If you are not happy with the result, contact us within a reasonable
        time and we will redo the work or refund you. Under the Swedish Consumer
        Services Act you may report a fault in the service for up to three
        years.
      </p>

      <h2>Disputes</h2>
      <p>
        If we cannot reach an agreement you can turn to the Swedish National
        Board for Consumer Disputes (ARN) or the EU online dispute resolution
        platform. We follow ARN&apos;s recommendations.
      </p>

      <h2>Contact</h2>
      <p>
        {BRAND}
        <br />
        {CONTACT_EMAIL}
        <br />
        {CONTACT_PHONE_DISPLAY}
      </p>
    </LegalPage>
  );
}
