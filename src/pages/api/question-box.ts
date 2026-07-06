export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';

// ─────────────────────────────────────────────────────────────────────────
// One-time Supabase setup — run this in the Supabase SQL editor:
//
//   create table if not exists public.question_box (
//     id         uuid primary key default gen_random_uuid(),
//     question   text not null,
//     target     text not null default 'E-Cell',
//     name       text,
//     created_at timestamptz not null default now()
//   );
//   create index if not exists question_box_created_idx
//     on public.question_box (created_at desc);
//   alter table public.question_box enable row level security;
// ─────────────────────────────────────────────────────────────────────────

const TARGETS = ['Founders', 'Mentors', 'E-Cell'];
const MAX_QUESTION = 240;
const MAX_NAME = 32;
const SHOW_LIMIT = 40;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async () => {
  const { data, error } = await supabaseAdmin
    .from('question_box')
    .select('id,question,target,name,created_at')
    .order('created_at', { ascending: false })
    .limit(SHOW_LIMIT);

  if (error) return json({ error: 'Could not open the box.' }, 500);
  return json({ items: data ?? [] });
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  if (body.hp) return json({ ok: true }); // honeypot

  const question = String(body.question ?? '').trim();
  const target = TARGETS.includes(body.target) ? body.target : 'E-Cell';
  const name = String(body.name ?? '').trim().slice(0, MAX_NAME);

  if (!question) return json({ error: 'Type your question first.' }, 400);
  if (question.length > MAX_QUESTION) return json({ error: `Keep it under ${MAX_QUESTION} characters.` }, 400);

  const { data, error } = await supabaseAdmin
    .from('question_box')
    .insert({ question, target, name: name || null })
    .select('id,question,target,name,created_at')
    .single();

  if (error) return json({ error: 'Could not drop your question.' }, 500);
  return json({ item: data }, 201);
};
