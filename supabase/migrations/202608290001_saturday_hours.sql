-- Saturday is bookable 08:00–20:00, matching Sunday. Append weekday 6 when missing.
update public.settings
set value = jsonb_set(
  value || jsonb_build_object(
    'saturdayStartHour', 8,
    'saturdayEndHour', 20
  ),
  '{weekdays}',
  case
    when coalesce(value->'weekdays', '[]'::jsonb) @> '[6]'::jsonb
      then coalesce(value->'weekdays', '[0,1,2,3,4,5,6]'::jsonb)
    when jsonb_typeof(value->'weekdays') = 'array'
      then (value->'weekdays') || '[6]'::jsonb
    else '[0,1,2,3,4,5,6]'::jsonb
  end
)
where key = 'booking_rules';
