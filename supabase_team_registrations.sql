-- Team registrations reuse the same registrations table — one row per person
-- (so every teammate still gets their own ticket_id/QR for individual check-in),
-- tagged with a shared team_name.

alter table public.registrations
  add column if not exists team_name text,
  add column if not exists is_team_leader boolean default false;

-- Common query once events have teams: "everyone on team X for event Y"
create index if not exists idx_registrations_event_team
  on public.registrations (event_id, team_name);
