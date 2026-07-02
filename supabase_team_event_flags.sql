-- Only events explicitly marked as team events show team-registration fields.
-- min/max include the team leader in the count (e.g. min=2, max=4 means "2 to 4 people total").

alter table public.events
  add column if not exists is_team_event boolean not null default false,
  add column if not exists min_team_size integer,
  add column if not exists max_team_size integer;
