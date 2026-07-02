export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const registrationId = formData.get('registrationId')?.toString();
  const eventId = formData.get('eventId')?.toString();

  if (registrationId) {
    await supabaseAdmin.from('registrations').delete().eq('id', registrationId);
  }

  return redirect(`/console/events/${eventId}/registrations`);
};
