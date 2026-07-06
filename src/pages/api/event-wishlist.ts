export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';

// ─────────────────────────────────────────────────────────────────────────
// One-time Supabase setup — run this in the Supabase SQL editor:
//
//   create table if not exists public.event_wishlist (
//     id         uuid primary key default gen_random_uuid(),
//     title      text not null,
//     reason     text,
//     name       text,
//     votes      integer not null default 0,
//     created_at timestamptz not null default now()
//   );
//   create index if not exists event_wishlist_rank_idx
//     on public.event_wishlist (votes desc, created_at desc);
//   alter table public.event_wishlist enable row level security;
//
//   -- atomic upvote (returns the new count)
//   create or replace function public.increment_event_vote(row_id uuid)
//   returns integer language sql volatile as $$
//     update public.event_wishlist set votes = votes + 1
//     where id = row_id returning votes;
//   $$;
// ─────────────────────────────────────────────────────────────────────────

const MAX_TITLE = 80;
const MAX_REASON = 140;
const MAX_NAME = 32;
const SHOW_LIMIT = 60;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async () => {
  const { data, error } = await supabaseAdmin
    .from('event_wishlist')
    .select('id,title,reason,name,votes,created_at')
    .order('votes', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(SHOW_LIMIT);

  if (error) return json({ error: 'Could not load the wishlist.' }, 500);
  return json({ items: data ?? [] });
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  // Upvote an existing idea.
  if (body.vote) {
    const { data, error } = await supabaseAdmin.rpc('increment_event_vote', { row_id: body.vote });
    if (error) return json({ error: 'Could not register your vote.' }, 500);
    return json({ votes: data });
  }

  if (body.hp) return json({ ok: true }); // honeypot

  const title = String(body.title ?? '').trim();
  const reason = String(body.reason ?? '').trim().slice(0, MAX_REASON);
  const name = String(body.name ?? '').trim().slice(0, MAX_NAME);

  if (!title) return json({ error: 'Name your event idea first.' }, 400);
  if (title.length > MAX_TITLE) return json({ error: `Keep the title under ${MAX_TITLE} characters.` }, 400);

  const { data, error } = await supabaseAdmin
    .from('event_wishlist')
    .insert({ title, reason: reason || null, name: name || null })
    .select('id,title,reason,name,votes,created_at')
    .single();

  if (error) return json({ error: 'Could not add your idea.' }, 500);
  return json({ item: data }, 201);
};
