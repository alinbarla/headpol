-- Daily booking caps (Mon–Fri vs weekend) and price increase to 899 kr.
-- Existing settings rows are patched in place; code defaults match these values.

update public.settings
set
  value = value
    || jsonb_build_object(
      'priceOre', 89900,
      'weekdayMaxBookings', 2,
      'weekendMaxBookings', 4
    ),
  updated_at = now()
where key = 'booking_rules';

alter table public.bookings
  alter column price_ore set default 89900;

comment on column public.bookings.price_ore is
  'Agreed price in öre (89900 = 899 kr) — integers only, never floats';
