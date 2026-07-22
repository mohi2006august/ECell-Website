export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';
import { getRegistrationStatus } from '../../lib/eventStatus.js';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid registration request.' }, 400);
  }

  const eventId = typeof body?.eventId === 'string' ? body.eventId : '';
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  if (!eventId || rows.length === 0) {
    return json({ error: 'Missing registration details.' }, 400);
  }

  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id, registration_open, registration_deadline, max_participants')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    return json({ error: 'Event not found.' }, 404);
  }

  const { count, error: countError } = await supabaseAdmin
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (countError) {
    return json({ error: 'Could not verify event capacity.' }, 500);
  }

  const status = getRegistrationStatus(event, count ?? 0);
  if (!status.canRegister) {
    const message =
      status.reason === 'deadline'
        ? 'Registration has closed for this event.'
        : status.reason === 'full'
          ? 'Registration is full for this event.'
          : "Registration isn't open yet.";
    return json({ error: message }, 409);
  }

  if (status.remainingSlots !== null && rows.length > status.remainingSlots) {
    return json({ error: `Only ${status.remainingSlots} registration slot(s) are left.` }, 409);
  }

  const cleanRows = rows.map((row: any) => ({
    event_id: eventId,
    ticket_id: typeof row.ticket_id === 'string' ? row.ticket_id : crypto.randomUUID(),
    team_name: row.team_name || null,
    is_team_leader: Boolean(row.is_team_leader),
    name: String(row.name ?? '').trim(),
    email: String(row.email ?? '').trim(),
    phone: row.phone || null,
    roll_number: row.roll_number || null,
    branch: row.branch || null,
    year_of_study: row.year_of_study || null,
    section: row.section || null,
    college: row.college || null,
  }));

  if (cleanRows.some((row) => !row.name || !row.email)) {
    return json({ error: 'Every registration needs a name and email.' }, 400);
  }

  const { data: registrations, error } = await supabaseAdmin
    .from('registrations')
    .insert(cleanRows)
    .select('ticket_id');

  if (error) {
    return json(
      {
        code: error.code,
        error:
          error.code === '23505'
            ? 'One of the emails entered is already registered for this event.'
            : 'Could not complete registration.',
      },
      400
    );
  }

  return json({ registrations });
};
