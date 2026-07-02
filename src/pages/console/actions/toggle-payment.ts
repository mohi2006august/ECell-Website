export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export const POST: APIRoute = async ({ request }) => {
  const { registrationId, current } = await request.json();

  if (!registrationId) {
    return new Response(JSON.stringify({ error: 'Missing registrationId.' }), { status: 400 });
  }

  // Only touches the boolean payment_verified column — payment_status is an enum
  // whose full set of valid values isn't confirmed, so it's left untouched here
  // rather than risk writing an invalid member (this exact mistake broke RLS earlier).
  const nextValue = current !== 'true';
  const { error } = await supabaseAdmin
    .from('registrations')
    .update({ payment_verified: nextValue })
    .eq('id', registrationId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
