# Strålkraft — Headlight Restoration Website

A bilingual (Swedish / English) marketing site for a headlight restoration business. Built with Next.js 16, TypeScript, Tailwind CSS, next-intl, and Framer Motion.

## Features

- **Swedish-first i18n** — `/sv` (default) and `/en`
- **Hero before/after slider** — [img-comparison-slider](https://github.com/sneas/img-comparison-slider) in the header
- **Process storyboard** — vertical cinematic timeline of restoration steps
- **Booking picker** — Supabase-backed slots (Sun–Fri 16:00–20:00), booked times greyed out
- **Contact** — phone `+46 76 344 11 68`, email `info@exposia.se`

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/sv](http://localhost:3000/sv) or [http://localhost:3000/en](http://localhost:3000/en).

## Production

```bash
npm run build
npm start
```

## Customization

### Business name & copy

Edit [`messages/sv.json`](messages/sv.json) and [`messages/en.json`](messages/en.json).

### Contact details

Update [`lib/booking.ts`](lib/booking.ts) and the `contact` section in both message files.

### Supabase bookings

1. Copy `.env.example` to `.env.local` and add your Supabase URL + anon key.
2. Migration lives in `supabase/migrations/202603160001_create_bookings.sql` (already applied if using the linked project).
3. Bookings table: `bookings(booking_date, booking_time, status)` with unique slot constraint.

Available slots: **Sunday–Friday**, **16:00–19:00** (service window until 20:00). Saturdays disabled.

### Images

Replace the placeholder photos with your own (keep the same descriptive file names for image SEO):

- `public/images/gallery/stralkastarepolering-fore-efter.webp` — hero before/after photo
- `public/images/steps/*.webp` — the six process photos (`maskering-`, `slipning-`, `polering-`, `uv-skydd-`, `kvalitetskontroll-`, `klar-stralkastare.webp`)
- For a real before/after pair, set `BEFORE_IMAGE` and `AFTER_IMAGE` in `components/hero/HeroComparisonSlider.tsx`

All process photos are served through `next/image`, so they are automatically re-encoded to AVIF/WebP and resized. The hero uses a native `<img>` (required by the comparison slider) — keep it optimized (WebP/AVIF, ~1024px wide).

### SEO configuration

- Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) to your production origin. It powers canonical URLs, hreflang, `sitemap.xml`, `robots.txt` and Open Graph.
- Business name, contact (NAP), geo, opening hours, service areas and keywords live in [`lib/seo.ts`](lib/seo.ts).
- Structured data (`Organization`, `LocalBusiness/AutoRepair`, `WebSite`, `Service`, `WebPage`, `BreadcrumbList`, `FAQPage`) is built in [`lib/structuredData.ts`](lib/structuredData.ts).
- Review schema is gated behind `REVIEWS_ARE_REAL` in `lib/structuredData.ts` — flip it to `true` only once the testimonials in `messages/*.json` are real.

### Brand name

Search for `Strålkraft` in the message files and components to rename.

## Project structure

```
app/[locale]/     — localized routes
components/       — UI sections
messages/         — SV/EN translations
lib/              — i18n routing, booking helpers
public/images/    — placeholder photos
```

## Tech stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- next-intl
- Framer Motion
- react-day-picker
- @img-comparison-slider/react
