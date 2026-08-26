-- Sunday is bookable 08:00–20:00; Mon–Fri stay 16:00–20:00.
update public.settings
set value = value || jsonb_build_object(
  'sundayStartHour', 8,
  'sundayEndHour', 20
)
where key = 'booking_rules';
