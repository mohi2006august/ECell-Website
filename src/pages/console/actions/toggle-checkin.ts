export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export const POST: APIRoute = async ({ request }) => {
  const { registrationId, current } = await request.json();

  if (!registrationId) {
    return new Response(JSON.stringify({ error: 'Missing registrationId.' }), { status: 400 });
  }

  const nextValue = current !== 'true';
  const { error } = await supabaseAdmin
    .from('registrations')
    .update({
      is_checked_in: nextValue,
      checked_in_at: nextValue ? new Date().toISOString() : null,
    })
    .eq('id', registrationId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
