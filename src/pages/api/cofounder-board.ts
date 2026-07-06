export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';

// ─────────────────────────────────────────────────────────────────────────
// One-time Supabase setup — run this in the Supabase SQL editor:
//
//   create table if not exists public.cofounder_posts (
//     id         uuid primary key default gen_random_uuid(),
//     project    text not null,
//     role       text not null,
//     name       text,
//     contact    text,
//     created_at timestamptz not null default now()
//   );
//   create index if not exists cofounder_posts_created_idx
//     on public.cofounder_posts (created_at desc);
//   alter table public.cofounder_posts enable row level security;
// ─────────────────────────────────────────────────────────────────────────

const MAX_PROJECT = 140;
const MAX_ROLE = 60;
const MAX_NAME = 32;
const MAX_CONTACT = 80;
const SHOW_LIMIT = 60;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async () => {
  const { data, error } = await supabaseAdmin
    .from('cofounder_posts')
    .select('id,project,role,name,contact,created_at')
    .order('created_at', { ascending: false })
    .limit(SHOW_LIMIT);

  if (error) return json({ error: 'Could not load the board.' }, 500);
  return json({ items: data ?? [] });
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  if (body.hp) return json({ ok: true }); // honeypot

  const project = String(body.project ?? '').trim();
  const role = String(body.role ?? '').trim();
  const name = String(body.name ?? '').trim().slice(0, MAX_NAME);
  const contact = String(body.contact ?? '').trim().slice(0, MAX_CONTACT);

  if (!project) return json({ error: 'Tell us what you’re building.' }, 400);
  if (!role) return json({ error: 'Add the role you’re looking for.' }, 400);
  if (project.length > MAX_PROJECT) return json({ error: `Keep it under ${MAX_PROJECT} characters.` }, 400);
  if (role.length > MAX_ROLE) return json({ error: `Keep the role under ${MAX_ROLE} characters.` }, 400);

  const { data, error } = await supabaseAdmin
    .from('cofounder_posts')
    .insert({ project, role, name: name || null, contact: contact || null })
    .select('id,project,role,name,contact,created_at')
    .single();

  if (error) return json({ error: 'Could not post that.' }, 500);
  return json({ item: data }, 201);
};
