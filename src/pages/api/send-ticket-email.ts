export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';
import { generateTicketsPdfBytes } from '../../lib/ticketPdf.js';

const MAILEROO_ENDPOINT = 'https://smtp.maileroo.com/api/v2/emails';

function buildEmailHtml(registration: any) {
  const event = registration.events ?? {};
  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <div style="height: 6px; background: linear-gradient(90deg, #b91c1c, #f97316); border-radius: 999px;"></div>
      <div style="padding: 24px 4px;">
        <p style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #b91c1c; font-weight: 600;">E-Cell VJIT</p>
        <h1 style="font-size: 22px; margin: 8px 0 16px;">You're registered, ${registration.name}!</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #333;">
          You're confirmed for <strong>${event.title ?? 'the event'}</strong>${dateStr ? ` on ${dateStr}` : ''}${event.venue ? ` at ${event.venue}` : ''}.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #333;">
          Your ticket is attached as a PDF — it includes your personal QR code. Bring it (digital or printed) to check in at the venue.
        </p>
        ${registration.team_name ? `<p style="font-size: 14px; color: #333;">Team: <strong>${registration.team_name}</strong></p>` : ''}
        <p style="font-size: 13px; color: #777; margin-top: 24px;">See you there!<br />E-Cell VJIT</p>
      </div>
    </div>
  `;
}

export const POST: APIRoute = async ({ request }) => {
  const maillerooApiKey = import.meta.env.MAILEROO_API_KEY;
  const fromAddress = import.meta.env.MAILEROO_FROM_ADDRESS;
  const fromName = import.meta.env.MAILEROO_FROM_NAME || 'E-Cell VJIT';

  if (!maillerooApiKey || !fromAddress) {
    return new Response(JSON.stringify({ error: 'Email sending is not configured.' }), { status: 500 });
  }

  let ticketIds: string[];
  try {
    const body = await request.json();
    ticketIds = Array.isArray(body.ticketIds) ? body.ticketIds.filter(Boolean) : [];
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 });
  }

  if (ticketIds.length === 0) {
    return new Response(JSON.stringify({ error: 'No ticket IDs provided.' }), { status: 400 });
  }

  const { data: registrations, error } = await supabaseAdmin
    .from('registrations')
    .select('id, name, email, phone, ticket_id, team_name, email_sent, events (title, date, time, venue)')
    .in('ticket_id', ticketIds);

  if (error || !registrations) {
    return new Response(JSON.stringify({ error: 'Could not load registrations.' }), { status: 500 });
  }

  const baseUrl = new URL(request.url).origin;
  const results = { sent: [] as string[], skipped: [] as string[], failed: [] as string[] };

  for (const registration of registrations) {
    if (registration.email_sent) {
      results.skipped.push(registration.ticket_id);
      continue;
    }

    try {
      const pdfBytes = await generateTicketsPdfBytes([registration], { baseUrl });
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

      const emailResponse = await fetch(MAILEROO_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${maillerooApiKey}`,
        },
        body: JSON.stringify({
          from: { address: fromAddress, display_name: fromName },
          to: [{ address: registration.email, display_name: registration.name }],
          subject: `Your ticket for ${registration.events?.title ?? 'the event'}`,
          html: buildEmailHtml(registration),
          attachments: [
            {
              file_name: 'ticket.pdf',
              content_type: 'application/pdf',
              content: pdfBase64,
            },
          ],
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok || !emailResult.success) {
        results.failed.push(registration.ticket_id);
        continue;
      }

      await supabaseAdmin
        .from('registrations')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq('id', registration.id);

      results.sent.push(registration.ticket_id);
    } catch {
      results.failed.push(registration.ticket_id);
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
