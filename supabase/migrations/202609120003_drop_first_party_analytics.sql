-- Remove first-party heatmap / form-input capture / dropped-visitor lead list.
-- Collection ran without consent and stored typed PII. Booking UTM attribution
-- stays in localStorage on the client and does not need these tables.

drop table if exists public.dropped_visitors cascade;
drop table if exists public.analytics_events cascade;
drop table if exists public.analytics_sessions cascade;

-- Settings key used by the heatmap collection toggle (safe if already absent).
delete from public.settings where key = 'analytics_settings';

notify pgrst, 'reload schema';
