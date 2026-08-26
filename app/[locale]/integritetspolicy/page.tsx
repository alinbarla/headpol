import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/layout/LegalPage";
import { Footer } from "@/components/layout/Footer";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/booking";
import { routing, type Locale } from "@/lib/i18n";
import { BRAND, buildPageMetadata } from "@/lib/seo";

const UPDATED = "2026-08-26";

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

  return buildPageMetadata({
    locale,
    path: "integritetspolicy",
    title: sv ? "Integritetspolicy" : "Privacy policy",
    description: sv
      ? `Så behandlar ${BRAND} dina personuppgifter enligt GDPR.`
      : `How ${BRAND} handles your personal data under the GDPR.`,
    bilingual: true,
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      {locale === "en" ? <PrivacyEn /> : <PrivacySv />}
      <Footer />
    </>
  );
}

function PrivacySv() {
  return (
    <LegalPage
      locale="sv"
      title="Integritetspolicy"
      updated={`Senast uppdaterad ${UPDATED}`}
    >
      <h2>Personuppgiftsansvarig</h2>
      <p>
        {BRAND} är personuppgiftsansvarig för de uppgifter du lämnar när du
        bokar. Kontakta oss på {CONTACT_EMAIL} eller {CONTACT_PHONE_DISPLAY} om
        du har frågor om hur vi behandlar dina uppgifter.
      </p>

      <h2>Vilka uppgifter vi samlar in</h2>
      <ul>
        <li>Namn, e-postadress och telefonnummer</li>
        <li>Adress och postnummer där arbetet ska utföras</li>
        <li>Bokad tid, språkval och eventuella noteringar om besöket</li>
        <li>Betalningsstatus och belopp — vi lagrar aldrig dina kortuppgifter</li>
      </ul>

      <h2>Varför vi behandlar dem</h2>
      <ul>
        <li>
          För att kunna utföra tjänsten du bokat och kontakta dig om besöket.
          Rättslig grund: fullgörande av avtal.
        </li>
        <li>
          För att skicka bokningsbekräftelse, påminnelse och kvitto. Rättslig
          grund: fullgörande av avtal.
        </li>
        <li>
          För att uppfylla bokföringsskyldigheten. Rättslig grund: rättslig
          förpliktelse enligt bokföringslagen.
        </li>
      </ul>
      <p>
        Vi använder inte dina uppgifter för marknadsföring och säljer dem aldrig
        vidare.
      </p>

      <h2>Personuppgiftsbiträden</h2>
      <p>Vi anlitar följande leverantörer som behandlar uppgifter åt oss:</p>
      <ul>
        <li>
          <strong>Stripe Payments Europe, Ltd.</strong> hanterar
          kortbetalningar och Swish när du väljer att betala i förväg. Stripe
          tar emot namn, e-postadress och betalningsuppgifter direkt från dig
          och är självständigt personuppgiftsansvarig för själva betalningen. Vi
          får aldrig se dina fullständiga kortuppgifter. Se{" "}
          <a
            href="https://stripe.com/se/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Stripes integritetspolicy
          </a>
          .
        </li>
        <li>
          <strong>Supabase</strong> är vår databasleverantör och lagrar
          bokningsuppgifterna inom EU.
        </li>
        <li>
          <strong>Vercel</strong> driftar webbplatsen.
        </li>
        <li>
          <strong>Google</strong> används för bekräftelsemejl (Gmail) samt
          Google Tag Manager och Google Ads, som mäter när en bokning blir
          betald.
        </li>
      </ul>

      <h2>Hur länge vi sparar uppgifterna</h2>
      <p>
        Bokningsuppgifter sparas i tre år, vilket motsvarar reklamationstiden
        enligt konsumenttjänstlagen. Underlag som räknas som
        räkenskapsinformation, till exempel betalningar och återbetalningar,
        sparas i sju år enligt bokföringslagen.
      </p>

      <h2>Dina rättigheter</h2>
      <p>
        Du har rätt att begära ett registerutdrag, rättelse av felaktiga
        uppgifter, radering, begränsning av behandlingen och dataportabilitet.
        Radering kan begränsas av vår bokföringsskyldighet. Hör av dig till{" "}
        {CONTACT_EMAIL} så svarar vi inom en månad.
      </p>
      <p>
        Om du anser att vi behandlar dina uppgifter felaktigt kan du klaga till
        Integritetsskyddsmyndigheten (IMY).
      </p>

      <h2>Kakor och mätning</h2>
      <p>
        Vi använder Google Tag Manager och Google Ads för att mäta när en
        bokning blir betald. Det kan sätta kakor eller liknande identifierare
        i din webbläsare. Vi kör inte Google Analytics för sidstatistik. Ditt
        språkval kan sparas lokalt i webbläsaren. Betalsidan hos Stripe sätter
        egna kakor som krävs för att betalningen ska fungera säkert.
      </p>

      <p>
        <Link href="/sv/villkor">Läs även våra villkor och avbokningsregler</Link>
        .
      </p>
    </LegalPage>
  );
}

function PrivacyEn() {
  return (
    <LegalPage
      locale="en"
      title="Privacy policy"
      updated={`Last updated ${UPDATED}`}
    >
      <h2>Data controller</h2>
      <p>
        {BRAND} is the data controller for the information you provide when you
        book. Contact us at {CONTACT_EMAIL} or {CONTACT_PHONE_DISPLAY} with any
        questions about how we handle your data.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Name, email address and phone number</li>
        <li>The address and postcode where the work is carried out</li>
        <li>Your booked time, language preference and any notes about the visit</li>
        <li>Payment status and amount — we never store your card details</li>
      </ul>

      <h2>Why we process it</h2>
      <ul>
        <li>
          To carry out the service you booked and contact you about the visit.
          Legal basis: performance of a contract.
        </li>
        <li>
          To send booking confirmations, reminders and receipts. Legal basis:
          performance of a contract.
        </li>
        <li>
          To meet Swedish bookkeeping requirements. Legal basis: legal
          obligation.
        </li>
      </ul>
      <p>
        We do not use your data for marketing and never sell it on.
      </p>

      <h2>Processors</h2>
      <p>We use the following providers, who process data on our behalf:</p>
      <ul>
        <li>
          <strong>Stripe Payments Europe, Ltd.</strong> handles card payments
          and Swish when you choose to pay in advance. Stripe receives your
          name, email address and payment details directly from you and is an
          independent controller for the payment itself. We never see your full
          card details. See{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
            Stripe&apos;s privacy policy
          </a>
          .
        </li>
        <li>
          <strong>Supabase</strong> is our database provider and stores booking
          data within the EU.
        </li>
        <li>
          <strong>Vercel</strong> hosts the website.
        </li>
        <li>
          <strong>Google</strong> is used for confirmation email (Gmail) and
          for Google Tag Manager and Google Ads, which measure when a booking
          is paid.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        Booking data is kept for three years, matching the complaint period
        under the Swedish Consumer Services Act. Records that count as
        accounting information, such as payments and refunds, are kept for seven
        years as required by the Swedish Bookkeeping Act.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to request a copy of your data, correction of
        inaccurate data, erasure, restriction of processing and data
        portability. Erasure may be limited by our bookkeeping obligations.
        Email {CONTACT_EMAIL} and we will respond within one month.
      </p>
      <p>
        If you believe we handle your data incorrectly, you can complain to the
        Swedish Authority for Privacy Protection (IMY).
      </p>

      <h2>Cookies and measurement</h2>
      <p>
        We use Google Tag Manager and Google Ads to measure when a booking is
        paid. That may set cookies or similar identifiers in your browser. We
        do not run Google Analytics for page statistics. Your language
        preference may be stored locally in your browser. Stripe&apos;s
        checkout page sets its own cookies that are necessary for the payment
        to work securely.
      </p>

      <p>
        <Link href="/en/villkor">
          See also our terms and cancellation policy
        </Link>
        .
      </p>
    </LegalPage>
  );
}
