import nodemailer from "nodemailer";
import {
  BOOKING_OLD_PRICE,
  BOOKING_PRICE,
  CONTACT_PHONE_DISPLAY,
  formatBookingDate,
  formatSwedishPostalCode,
  isCompletePostalCode,
  isStockholmCountyPostalCode,
  parseDateKey,
} from "@/lib/booking";
import { BRAND } from "@/lib/seo";

export const BOOKING_MAILBOX = "teo@stralkastarpolering.se";

export type BookingNotice = {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  locale: "sv" | "en";
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function priceLine(locale: "sv" | "en"): string {
  if (locale === "en") {
    return `${BOOKING_PRICE.replace("/par", "/pair")}`;
  }
  return `${BOOKING_PRICE} (tidigare ${BOOKING_OLD_PRICE})`;
}

function formattedDate(notice: BookingNotice): string {
  return formatBookingDate(parseDateKey(notice.date), notice.locale);
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

function clientEmailCopy(notice: BookingNotice) {
  const dateLabel = formattedDate(notice);
  const when = `${escapeHtml(dateLabel)} · ${escapeHtml(notice.time)}`;
  const address = escapeHtml(notice.address);
  const postalCode = escapeHtml(notice.postalCode);
  const price = escapeHtml(priceLine(notice.locale));

  if (notice.locale === "en") {
    return {
      subject: `Booking confirmation — ${BRAND} ${notice.date} ${notice.time}`,
      html: `
        <p>Hi ${escapeHtml(notice.name)},</p>
        <p>Your headlight restoration slot is reserved.</p>
        <p><strong>${when}</strong></p>
        <p>Price: <strong>${price}</strong></p>
        <p>We come to you at:<br/>${address}<br/>${postalCode}</p>
        <p>If you need to change the time, call ${escapeHtml(CONTACT_PHONE_DISPLAY)} or reply to this email.</p>
        <p>${escapeHtml(BRAND)}<br/>${escapeHtml(BOOKING_MAILBOX)}</p>
      `,
    };
  }

  return {
    subject: `Bokningsbekräftelse — ${BRAND} ${notice.date} ${notice.time}`,
    html: `
      <p>Hej ${escapeHtml(notice.name)},</p>
      <p>Din tid för strålkastarepolering är reserverad.</p>
      <p><strong>${when}</strong></p>
      <p>Pris: <strong>${price}</strong></p>
      <p>Vi kommer till dig på:<br/>${address}<br/>${postalCode}</p>
      <p>Behöver du ändra tiden, ring ${escapeHtml(CONTACT_PHONE_DISPLAY)} eller svara på det här mejlet.</p>
      <p>${escapeHtml(BRAND)}<br/>${escapeHtml(BOOKING_MAILBOX)}</p>
    `,
  };
}

function ownerEmailCopy(notice: BookingNotice) {
  const dateLabel = formattedDate(notice);
  const when = `${escapeHtml(dateLabel)} · ${escapeHtml(notice.time)}`;
  const price = escapeHtml(priceLine(notice.locale));

  if (notice.locale === "en") {
    return {
      subject: `New booking ${notice.date} ${notice.time} — ${notice.name}`,
      html: `
        <p>New booking from the English site.</p>
        <p><strong>${when}</strong></p>
        <p>Price: <strong>${price}</strong></p>
        <p>Name: ${escapeHtml(notice.name)}<br/>
        Email: ${escapeHtml(notice.email)}<br/>
        Phone: ${escapeHtml(notice.phone)}<br/>
        Address: ${escapeHtml(notice.address)}<br/>
        Postal code: ${escapeHtml(notice.postalCode)}</p>
      `,
    };
  }

  return {
    subject: `Ny bokning ${notice.date} ${notice.time} — ${notice.name}`,
    html: `
      <p>Ny bokning via webbplatsen.</p>
      <p><strong>${when}</strong></p>
      <p>Pris: <strong>${price}</strong></p>
      <p>Namn: ${escapeHtml(notice.name)}<br/>
      E-post: ${escapeHtml(notice.email)}<br/>
      Telefon: ${escapeHtml(notice.phone)}<br/>
      Adress: ${escapeHtml(notice.address)}<br/>
      Postnummer: ${escapeHtml(notice.postalCode)}</p>
    `,
  };
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

export async function notifyBooking(notice: BookingNotice): Promise<void> {
  const mailbox = process.env.GMAIL_USER ?? BOOKING_MAILBOX;
  const client = clientEmailCopy(notice);
  const owner = ownerEmailCopy(notice);

  const results = await Promise.allSettled([
    sendMail({
      to: notice.email,
      subject: client.subject,
      html: client.html,
      replyTo: mailbox,
    }),
    sendMail({
      to: mailbox,
      subject: owner.subject,
      html: owner.html,
      replyTo: notice.email,
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Booking email failed", result.reason);
    }
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
