# PPF product swap — Cursor implementation spec

Source of truth for replacing moped/företag with three bookable headlight products. Do not invent body PPF, moped SKUs, företag volume checkout, or warranty longer than 12 months.

## Scope

Headlight PPF film (TPU on polycarbonate), not body wrap. Prices are per pair.

| SKU id | Page slug | List | Sale |
|--------|-----------|------|------|
| `polering` | `stralkastarpolering` | 1499 kr | 899 kr |
| `ppf` | `ppf` | 2499 kr | 1899 kr |
| `polering-ppf` | `polering-ppf` | 3499 kr | 2599 kr |

Keep `/stralkastarrenovering` as a process/SEO cluster (not a checkout SKU). Smootherly stays polering-only at 799 kr.

## URLs

- `/` — three product cards → product pages + `/?service={id}#booking`
- `/stralkastarpolering`, `/ppf`, `/polering-ppf` — dedicated service pages
- `/priser` — same three SKUs
- `/foretagskunder` — permanent redirect to `/priser` (no soft 404)

## Catalog

[`lib/products.ts`](../lib/products.ts) is the only public price source. Homepage, `/priser`, JSON-LD Offers, Stripe `unit_amount`, and the booking UI read it. Never trust a client-sent amount. Admin `rules.priceOre` is a polering fallback for legacy/admin only.

Display labels stay compact: `899kr`, `1899kr`, `2599kr` (no space), unit `par`.

Booking deep-link: `/?service=polering#booking` (query before hash). Invalid/missing `service` → `polering`.

## Homepage UX

[`components/services/ServicesSection.tsx`](../components/services/ServicesSection.tsx)

- 1 column mobile, 3 equal cards from `md`
- Per card: icon, title, one-line benefit, strikethrough + now via `PriceSticker`, **Läs mer** (product URL) and **Boka** (`/?service={id}#booking`)
- No nested interactive links (article + buttons, not a wrapping `<a>`)
- Polering badge: Mest bokad. Combo badge: Paket / Spara 199 kr
- In-section chips (Polering / PPF / Paket) scroll to the matching card (`id="service-{id}"`)
- Section remains `id="services"`

Nav: Polering · PPF · Polering+PPF · Priser · Boka. FAQ and Renovering live in the footer. Footer drops Företag; adds `/ppf` and `/polering-ppf`.

## Dedicated page copy (unique, Swedish)

### `/ppf`

H1: PPF-folie för strålkastare. Explain TPU/PPF vs UV-keramik, stone-chip protection, when film-only is enough vs when oxidized glass must be polished first. Price 1899 kr/par (was 2499). 4–6 FAQs. No fake PPF photos; do not reuse polish before/after as if it were film.

### `/polering-ppf`

H1: Polering + PPF. Same visit: polish then film. Why 2599 beats 899+1899 (save 199 kr). For besiktning + longer protection. 4–6 FAQs.

### `/stralkastarpolering`

Remove moped 499 kr and företag offert. Mention PPF/combo as optional next step. Motorcycles may still be mentioned as polycarbonate glass, without a separate price.

### `/priser`

Three tiers matching the catalog, with includes lists, Boka + Läs mer.

Location pages keep polering intent. Replace `foretagskunder` related links with `ppf`. Rewrite “företagssidan” / “MC från 499 kr” copy.

## Metadata / SEO

- Unique title, description, H1 per hub. Titles include price + Stockholm/garanti where it fits ~50–60 chars.
- `DATE_MODIFIED` = `2026-09-19`
- `NAP.priceRange` = `899–2599 kr`
- Keywords add: `ppf strålkastare`, `strålkastarfolie`, `ppf folie`, `polering ppf`
- Home metadata + FAQ cost answers list all three sale prices
- `llms.txt` includes `service-ppf` and `service-combo`
- Terms mention the three prepaid prices
- Cluster kinds: `service-ppf`, `service-combo`
- Sitemap via `CLUSTER_SLUGS`

## JSON-LD (Service + Offer, not Product)

Do **not** use Product merchant listings (no shipping/returns).

Stable `@id`s: `{SITE_URL}/#service-polering`, `#service-ppf`, `#service-combo`. Keep `#service-renovering` on the renovering page only.

Each Offer:

- `url` = product page
- `price` = sale amount (string digits, e.g. `"899"`)
- `priceCurrency` = `SEK`
- `availability` = `https://schema.org/InStock`
- `priceSpecification`: `UnitPriceSpecification` with `priceType` `https://schema.org/ListPrice` and `https://schema.org/SalePrice`, `valueAddedTaxIncluded: true`

Home `@graph`: three Services with their own Offers (do not dump all offers onto polering). `/priser`: `ItemList` of the three Offers. LocalBusiness `makesOffer` references the three service `@id`s. Visible prices must match schema.

FAQPage stays for crawlers; Google FAQ rich results are gone as of May 2026.

## Booking (3 SKUs)

1. Migration: `bookings.service_id text not null default 'polering'` with check `('polering','ppf','polering-ppf')`.
2. `POST /api/bookings` accepts `serviceId`, validates against catalog, sets `price_ore` server-side.
3. `BookingPicker`: radio/cards with old/new price; init from `?service=`; Smootherly has no selector.
4. Stripe `price_data.product` = Dashboard product for the SKU (`prod_VHrkNll8ISAgkh` PPF, `prod_VHrlohDJW1gelD` combo, locale products for polering); `unit_amount` from catalog.
5. Confirmation, emails, admin list/detail/new form show service name + amount.
6. Same calendar slot occupancy for all SKUs. Do not invent longer job durations.

## Files to touch

- `lib/products.ts` (new)
- `lib/content/{types,slugs,hubs,locations,localities}.ts`
- `lib/{seo,structuredData,llmsTxt,stripe,bookingConfirmation,bookingNotify}.ts`
- `lib/supabase/server.ts`, `lib/admin/{data,labels}.ts`
- `messages/{sv,en}.json`
- `components/services/ServicesSection.tsx`
- `components/content/{PriceCards,ClusterPage}.tsx`
- `components/layout/{SiteHeader,Footer}.tsx`
- `components/booking/{BookingPicker,BookingConfirmationView}.tsx`
- `components/admin/{NewBookingForm,BookingCard}.tsx`
- `app/api/bookings/route.ts`, `app/admin/actions.ts`, `app/admin/bookings/[id]/page.tsx`
- `app/[locale]/villkor/page.tsx`
- `next.config.ts`
- `supabase/migrations/202609190001_booking_service_id.sql`

## Out of scope

Body PPF, moped SKU, företag volume checkout, changing Smootherly 799 kr, new photography.
