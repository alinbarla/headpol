-- Production booking_rules can have saturdayStartHour/saturdayEndHour set
-- while weekdays still omits 6. parseBookingRules only backfills Saturday
-- when those hour fields are absent, so Saturday stayed closed. Re-append 6.

update public.settings
set value = jsonb_set(
  value,
  '{weekdays}',
  case
    when coalesce(value->'weekdays', '[]'::jsonb) @> '[6]'::jsonb
      then coalesce(value->'weekdays', '[0,1,2,3,4,5,6]'::jsonb)
    when jsonb_typeof(value->'weekdays') = 'array'
      then (value->'weekdays') || '[6]'::jsonb
    else '[0,1,2,3,4,5,6]'::jsonb
  end
)
where key = 'booking_rules'
  and not coalesce(value->'weekdays', '[]'::jsonb) @> '[6]'::jsonb;
