export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';

// ─────────────────────────────────────────────────────────────────────────
// One-time Supabase setup — run this in the Supabase SQL editor:
//
//   create table if not exists public.sticky_notes (
//     id         uuid primary key default gen_random_uuid(),
//     name       text,
//     message    text not null,
//     color      text not null default 'amber',
//     created_at timestamptz not null default now()
//   );
//   create index if not exists sticky_notes_created_idx
//     on public.sticky_notes (created_at desc);
//   -- All access goes through this server route using the service-role key,
//   -- so keep RLS on with no public policies (nobody can touch the table
//   -- directly with the anon key).
//   alter table public.sticky_notes enable row level security;
// ─────────────────────────────────────────────────────────────────────────

const COLORS = ['amber', 'rose', 'orange', 'lime', 'sky', 'violet'];
const MAX_MESSAGE = 140;
const MAX_NAME = 32;
const SHOW_LIMIT = 80; // "if full, only show some" — newest N are returned

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async () => {
  const { data, error } = await supabaseAdmin
    .from('sticky_notes')
    .select('id,name,message,color,created_at')
    .order('created_at', { ascending: false })
    .limit(SHOW_LIMIT);

  if (error) return json({ error: 'Could not load the wall.' }, 500);
  return json({ notes: data ?? [] });
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Honeypot: bots fill hidden fields — silently drop them.
  if (body.hp) return json({ ok: true });

  const message = String(body.message ?? '').trim();
  const name = String(body.name ?? '').trim().slice(0, MAX_NAME);
  const color = COLORS.includes(body.color) ? body.color : 'amber';

  if (!message) return json({ error: 'Write something first.' }, 400);
  if (message.length > MAX_MESSAGE) {
    return json({ error: `Keep it under ${MAX_MESSAGE} characters.` }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from('sticky_notes')
    .insert({ name: name || null, message, color })
    .select('id,name,message,color,created_at')
    .single();

  if (error) return json({ error: 'Could not stick your note.' }, 500);
  return json({ note: data }, 201);
};
