-- Enable Postgres schedulers used to call /api/cron/seo from outside Vercel.
-- The actual cron.schedule() call needs the site URL and CRON_SECRET; those
-- live in Vault and are applied from supabase/seo-cron-schedule.example.sql
-- in the dashboard, never committed with real values.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
grant usage on schema net to postgres;
