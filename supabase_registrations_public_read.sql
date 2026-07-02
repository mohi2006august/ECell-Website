-- Allow public read access to registrations (simpler than the ticket-lookup RPC approach).
-- Insert is already restricted to open events via the existing "Public can register for open events" policy.
-- No update/delete policy exists for anon/authenticated, so this only opens reading, not writing.

create policy "Public can view registrations"
  on public.registrations
  for select
  to anon, authenticated
  using (true);
