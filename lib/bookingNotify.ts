import nodemailer from "nodemailer";
import {
  CONTACT_PHONE_DISPLAY,
  formatBookingDate,
  formatOre,
  formatSwedishPostalCode,
  isCompletePostalCode,
  isStockholmCountyPostalCode,
  parseDateKey,
} from "@/lib/booking";
import { BRAND } from "@/lib/seo";

export const BOOKING_MAILBOX = "teo@stralkastarpolering.se";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getTransporter() {
  const user = process.env.GMAIL_USER ?? BOOKING_MAILBOX;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    throw new Error("Missing GMAIL_APP_PASSWORD");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const user = process.env.GMAIL_USER ?? BOOKING_MAILBOX;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `${BRAND} <${user}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });
}

/**
 * Shared shape for the transactional emails the admin and the webhook send.
 * These are triggered from booking records rather than from the booking form.
 */
type CustomerNotice = {
  date: string;
  time: string;
  name: string;
  email: string;
  locale: string;
};

function localeOf(notice: { locale: string }): "sv" | "en" {
  return notice.locale === "en" ? "en" : "sv";
}

function whenLine(notice: CustomerNotice): string {
  const locale = localeOf(notice);
  const dateLabel = formatBookingDate(parseDateKey(notice.date), locale);
  return `${escapeHtml(dateLabel)} · ${escapeHtml(notice.time)}`;
}

function signature(): string {
  return `<p>${escapeHtml(BRAND)}<br/>${escapeHtml(BOOKING_MAILBOX)}<br/>${escapeHtml(
    CONTACT_PHONE_DISPLAY
  )}</p>`;
}

/** Fire-and-forget: a failed email must never roll back the change it reports. */
async function sendToCustomer(
  notice: CustomerNotice,
  copy: { subject: string; html: string }
): Promise<void> {
  if (!notice.email) return;

  const mailbox = process.env.GMAIL_USER ?? BOOKING_MAILBOX;
  try {
    await sendMail({
      to: notice.email,
      subject: copy.subject,
      html: copy.html,
      replyTo: mailbox,
    });
  } catch (error) {
    console.error(`Email failed: ${copy.subject}`, error);
  }
}

export async function notifyBookingRescheduled(
  notice: CustomerNotice & { previousDate: string; previousTime: string }
): Promise<void> {
  const locale = localeOf(notice);
  const previous = `${escapeHtml(
    formatBookingDate(parseDateKey(notice.previousDate), locale)
  )} · ${escapeHtml(notice.previousTime)}`;

  const copy =
    locale === "en"
      ? {
          subject: `Your booking moved — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hi ${escapeHtml(notice.name)},</p>
        <p>Your headlight restoration has been moved.</p>
        <p>Previously: <s>${previous}</s><br/>
        New time: <strong>${whenLine(notice)}</strong></p>
        <p>If this does not suit you, call ${escapeHtml(CONTACT_PHONE_DISPLAY)} or reply to this email.</p>
        ${signature()}
      `,
        }
      : {
          subject: `Din tid är flyttad — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hej ${escapeHtml(notice.name)},</p>
        <p>Din tid för strålkastarpolering har flyttats.</p>
        <p>Tidigare: <s>${previous}</s><br/>
        Ny tid: <strong>${whenLine(notice)}</strong></p>
        <p>Passar det inte, ring ${escapeHtml(CONTACT_PHONE_DISPLAY)} eller svara på det här mejlet.</p>
        ${signature()}
      `,
        };

  await sendToCustomer(notice, copy);
}

export async function notifyBookingCancelled(
  notice: CustomerNotice & { reason?: string }
): Promise<void> {
  const locale = localeOf(notice);
  const reason = notice.reason?.trim()
    ? `<p>${escapeHtml(notice.reason.trim())}</p>`
    : "";

  const copy =
    locale === "en"
      ? {
          subject: `Booking cancelled — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hi ${escapeHtml(notice.name)},</p>
        <p>Your booking on <strong>${whenLine(notice)}</strong> has been cancelled.</p>
        ${reason}
        <p>To book a new time, visit our site or call ${escapeHtml(CONTACT_PHONE_DISPLAY)}.</p>
        ${signature()}
      `,
        }
      : {
          subject: `Bokning avbokad — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hej ${escapeHtml(notice.name)},</p>
        <p>Din bokning <strong>${whenLine(notice)}</strong> är avbokad.</p>
        ${reason}
        <p>Vill du boka en ny tid, gå in på vår webbplats eller ring ${escapeHtml(CONTACT_PHONE_DISPLAY)}.</p>
        ${signature()}
      `,
        };

  await sendToCustomer(notice, copy);
}

export async function notifyPaymentLink(
  notice: CustomerNotice & { amountOre: number; checkoutUrl: string }
): Promise<void> {
  const locale = localeOf(notice);
  const amount = escapeHtml(formatOre(notice.amountOre));
  const url = escapeHtml(notice.checkoutUrl);

  const copy =
    locale === "en"
      ? {
          subject: `Payment link — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hi ${escapeHtml(notice.name)},</p>
        <p>Here is the payment link for your booking on <strong>${whenLine(notice)}</strong>.</p>
        <p>Amount: <strong>${amount}</strong></p>
        <p><a href="${url}">Pay now</a></p>
        <p>You can also pay on site if you prefer.</p>
        ${signature()}
      `,
        }
      : {
          subject: `Betallänk — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hej ${escapeHtml(notice.name)},</p>
        <p>Här är betallänken för din bokning <strong>${whenLine(notice)}</strong>.</p>
        <p>Belopp: <strong>${amount}</strong></p>
        <p><a href="${url}">Betala nu</a></p>
        <p>Du kan också betala på plats om du hellre vill det.</p>
        ${signature()}
      `,
        };

  await sendToCustomer(notice, copy);
}

export async function notifyPaymentReceipt(
  notice: CustomerNotice & { amountOre: number; address: string }
): Promise<void> {
  const locale = localeOf(notice);
  const amount = escapeHtml(formatOre(notice.amountOre));
  // 899 kr is VAT-inclusive; Swedish moms on this service is 25%.
  const vat = escapeHtml(formatOre(Math.round(notice.amountOre * 0.2)));
  const address = escapeHtml(notice.address);

  const copy =
    locale === "en"
      ? {
          subject: `Payment received — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hi ${escapeHtml(notice.name)},</p>
        <p>Thank you, your payment is confirmed and your slot is booked.</p>
        <p><strong>${whenLine(notice)}</strong></p>
        <p>Paid: <strong>${amount}</strong> (of which VAT 25%: ${vat})</p>
        <p>We come to you at:<br/>${address}</p>
        ${signature()}
      `,
        }
      : {
          subject: `Betalning mottagen — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hej ${escapeHtml(notice.name)},</p>
        <p>Tack! Din betalning är bekräftad och tiden är bokad.</p>
        <p><strong>${whenLine(notice)}</strong></p>
        <p>Betalt: <strong>${amount}</strong> (varav moms 25%: ${vat})</p>
        <p>Vi kommer till dig på:<br/>${address}</p>
        ${signature()}
      `,
        };

  await sendToCustomer(notice, copy);
}

export async function notifyRefund(
  notice: CustomerNotice & { amountOre: number }
): Promise<void> {
  const locale = localeOf(notice);
  const amount = escapeHtml(formatOre(notice.amountOre));

  const copy =
    locale === "en"
      ? {
          subject: `Refund issued — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hi ${escapeHtml(notice.name)},</p>
        <p>We have refunded <strong>${amount}</strong> for your booking on ${whenLine(notice)}.</p>
        <p>Card refunds usually take a few business days; Swish refunds arrive within minutes.</p>
        ${signature()}
      `,
        }
      : {
          subject: `Återbetalning genomförd — ${BRAND} ${notice.date} ${notice.time}`,
          html: `
        <p>Hej ${escapeHtml(notice.name)},</p>
        <p>Vi har återbetalat <strong>${amount}</strong> för din bokning ${whenLine(notice)}.</p>
        <p>Kortåterbetalningar tar oftast några bankdagar, Swish-återbetalningar kommer inom några minuter.</p>
        ${signature()}
      `,
        };

  await sendToCustomer(notice, copy);
}

export async function notifyReminder(
  notice: CustomerNotice & { address: string }
): Promise<void> {
  const locale = localeOf(notice);
  const address = escapeHtml(notice.address);

  const copy =
    locale === "en"
      ? {
          subject: `Reminder: we see you tomorrow — ${BRAND} ${notice.time}`,
          html: `
        <p>Hi ${escapeHtml(notice.name)},</p>
        <p>A reminder about your headlight restoration tomorrow.</p>
        <p><strong>${whenLine(notice)}</strong></p>
        <p>We come to you at:<br/>${address}</p>
        <p>Please make sure the car is accessible and parked outside. If anything has changed, call ${escapeHtml(
          CONTACT_PHONE_DISPLAY
        )}.</p>
        ${signature()}
      `,
        }
      : {
          subject: `Påminnelse: vi ses imorgon — ${BRAND} ${notice.time}`,
          html: `
        <p>Hej ${escapeHtml(notice.name)},</p>
        <p>En påminnelse om din strålkastarpolering imorgon.</p>
        <p><strong>${whenLine(notice)}</strong></p>
        <p>Vi kommer till dig på:<br/>${address}</p>
        <p>Se gärna till att bilen står tillgänglig utomhus. Har något ändrats, ring ${escapeHtml(
          CONTACT_PHONE_DISPLAY
        )}.</p>
        ${signature()}
      `,
        };

  await sendToCustomer(notice, copy);
}

/**
 * Owner-facing alert, always in Swedish. Web bookings reach here from the
 * Stripe webhook rather than the booking form, because a booking only becomes
 * real once it is paid.
 */
export async function notifyOwnerBooking(notice: {
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  amountOre?: number;
  source: "web" | "admin";
}): Promise<void> {
  const mailbox = process.env.GMAIL_USER ?? BOOKING_MAILBOX;
  const heading =
    notice.source === "web"
      ? "Ny betald bokning via webbplatsen."
      : "Bokning inlagd från admin.";
  const title = notice.source === "web" ? "Ny bokning" : "Manuell bokning";

  const lines = [
    `Namn: ${escapeHtml(notice.name)}`,
    `Telefon: ${escapeHtml(notice.phone)}`,
    notice.email ? `E-post: ${escapeHtml(notice.email)}` : null,
    `Adress: ${escapeHtml(notice.address)}`,
    typeof notice.amountOre === "number"
      ? `Betalt: ${escapeHtml(formatOre(notice.amountOre))}`
      : null,
  ].filter(Boolean);

  try {
    await sendMail({
      to: mailbox,
      subject: `${title} ${notice.date} ${notice.time} — ${notice.name}`,
      html: `
        <p>${heading}</p>
        <p><strong>${escapeHtml(notice.date)} · ${escapeHtml(notice.time)}</strong></p>
        <p>${lines.join("<br/>")}</p>
      `,
    });
  } catch (error) {
    console.error("Owner booking alert failed", error);
  }
}

export function parseBookingContact(body: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  locale?: string;
}):
  | {
      name: string;
      email: string;
      phone: string;
      address: string;
      postalCode: string;
      locale: "sv" | "en";
    }
  | { error: string } {
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const address = (body.address ?? "").trim().replace(/\s+/g, " ");
  const postalCode = formatSwedishPostalCode(body.postalCode ?? "");
  const locale = body.locale === "en" ? "en" : "sv";

  if (name.length < 2 || name.length > 80) {
    return { error: "Invalid name" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return { error: "Invalid email" };
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || phone.length > 40) {
    return { error: "Invalid phone" };
  }

  if (address.length < 8 || address.length > 200) {
    return { error: "Invalid address" };
  }

  if (!isCompletePostalCode(postalCode)) {
    return { error: "Invalid postal code" };
  }

  if (!isStockholmCountyPostalCode(postalCode)) {
    return { error: "OUT_OF_SERVICE_AREA" };
  }

  return { name, email, phone, address, postalCode, locale };
}
