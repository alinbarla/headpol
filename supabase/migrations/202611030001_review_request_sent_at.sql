-- Post-job Google review request email.
--
-- review_request_sent_at is claimed with `where review_request_sent_at is null`
-- before the email goes out, so a double click or a second Completed never
-- emails the same customer twice. Existing rows stay null on purpose: nothing
-- is sent retroactively, because the email only goes out when the admin marks
-- a booking Completed while the setting below is on.

alter table public.bookings
  add column if not exists review_request_sent_at timestamptz;

comment on column public.bookings.review_request_sent_at is
  'When the post-job Google review request email was sent (null = never)';

-- Off until the owner has read the wording and switches it on in admin
-- Settings. The code also treats a missing row as off.
insert into public.settings (key, value)
values ('review_requests', jsonb_build_object('enabled', false))
on conflict (key) do nothing;

notify pgrst, 'reload schema';
