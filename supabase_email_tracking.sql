-- Tracks whether a ticket email has already gone out, so revisiting the
-- confirmation page (or a network retry) doesn't re-send the same email.

alter table public.registrations
  add column if not exists email_sent boolean not null default false,
  add column if not exists email_sent_at timestamp without time zone;
