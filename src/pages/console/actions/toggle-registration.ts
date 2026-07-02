export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const eventId = formData.get('eventId')?.toString();
  const current = formData.get('current')?.toString() === 'true';

  if (eventId) {
    await supabaseAdmin.from('events').update({ registration_open: !current }).eq('id', eventId);
  }

  return redirect('/console');
};
