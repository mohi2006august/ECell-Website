import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

const PAGE_WIDTH = 380;
const PAGE_HEIGHT = 600;
const MARGIN = 20;

const CARD_X = MARGIN;
const CARD_Y = MARGIN;
const CARD_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CARD_HEIGHT = PAGE_HEIGHT - MARGIN * 2;

const RED = rgb(0.73, 0.11, 0.11);
const ORANGE = rgb(0.98, 0.45, 0.09);
const DARK_TEXT = rgb(0.1, 0.09, 0.09);
const GRAY_TEXT = rgb(0.42, 0.42, 0.42);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);
const WHITE = rgb(1, 1, 1);

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawAccentBar(page, x, y, width, height) {
  const steps = 48;
  const stepWidth = width / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    page.drawRectangle({
      x: x + i * stepWidth,
      y,
      width: stepWidth + 0.5,
      height,
      color: rgb(lerp(RED.red, ORANGE.red, t), lerp(RED.green, ORANGE.green, t), lerp(RED.blue, ORANGE.blue, t)),
    });
  }
}

function drawDashedLineHorizontal(page, y, xStart, xEnd, color) {
  const dash = 4;
  const gap = 3;
  let x = xStart;
  while (x < xEnd) {
    const segmentEnd = Math.min(x + dash, xEnd);
    page.drawLine({ start: { x, y }, end: { x: segmentEnd, y }, thickness: 1, color });
    x += dash + gap;
  }
}

function fitText(font, text, size, maxWidth) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && font.widthOfTextAtSize(`${truncated}…`, size) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

async function loadLogoBytes(baseUrl = '') {
  // In the browser, a relative URL resolves against the page origin. Node's
  // fetch (used server-side, e.g. the email API route) has no implicit origin,
  // so callers running server-side must pass an absolute baseUrl.
  try {
    const response = await fetch(`${baseUrl}/images/ecell-logo.png`);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

async function drawTicketPage(pdfDoc, fonts, logoImage, registration) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { bold, regular } = fonts;
  const event = registration.events ?? {};
  const contentWidth = CARD_WIDTH - 44;

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: WHITE });

  // Card
  page.drawRectangle({
    x: CARD_X,
    y: CARD_Y,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
    color: WHITE,
  });

  // Top accent bar
  drawAccentBar(page, CARD_X, CARD_Y + CARD_HEIGHT - 6, CARD_WIDTH, 6);

  const contentX = CARD_X + 22;
  let cursorY = CARD_Y + CARD_HEIGHT - 28;

  // Logo + wordmark
  if (logoImage) {
    const logoSize = 24;
    page.drawImage(logoImage, { x: contentX, y: cursorY - logoSize + 6, width: logoSize, height: logoSize });
    page.drawText('E-CELL VJIT', {
      x: contentX + logoSize + 10,
      y: cursorY - logoSize / 2 - 2,
      size: 11,
      font: bold,
      color: DARK_TEXT,
    });
  } else {
    page.drawText('E-CELL VJIT', { x: contentX, y: cursorY - 9, size: 11, font: bold, color: DARK_TEXT });
  }

  cursorY -= 36;

  // Event title
  const title = fitText(bold, event.title ?? 'Event', 16, contentWidth);
  page.drawText(title, { x: contentX, y: cursorY, size: 16, font: bold, color: DARK_TEXT });
  cursorY -= 20;

  // Date / time / venue
  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const meta = fitText(regular, [dateStr, event.time, event.venue].filter(Boolean).join('  ·  '), 9, contentWidth);
  page.drawText(meta, { x: contentX, y: cursorY, size: 9, font: regular, color: GRAY_TEXT });
  cursorY -= 22;

  // Perforation (horizontal, cutting across the full card width)
  drawDashedLineHorizontal(page, cursorY, CARD_X + 4, CARD_X + CARD_WIDTH - 4, LIGHT_GRAY);
  page.drawCircle({ x: CARD_X, y: cursorY, size: 9, color: WHITE });
  page.drawCircle({ x: CARD_X + CARD_WIDTH, y: cursorY, size: 9, color: WHITE });
  cursorY -= 24;

  // Attendee details
  const rows = [
    { label: 'NAME', value: registration.name },
    { label: 'EMAIL', value: registration.email },
    { label: 'PHONE', value: registration.phone },
    { label: 'TEAM', value: registration.team_name },
  ].filter((row) => row.value);

  const labelWidth = 56;
  for (const row of rows) {
    page.drawText(row.label, { x: contentX, y: cursorY, size: 8, font: bold, color: RED });
    const value = fitText(regular, String(row.value), 10.5, contentWidth - labelWidth);
    page.drawText(value, { x: contentX + labelWidth, y: cursorY, size: 10.5, font: regular, color: DARK_TEXT });
    cursorY -= 20;
  }

  cursorY -= 18;

  // Big QR, centered
  const qrDataUrl = await QRCode.toDataURL(registration.ticket_id, { width: 500, margin: 1 });
  const qrBytes = await fetch(qrDataUrl).then((r) => r.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrBytes);

  const qrSize = Math.min(260, contentWidth);
  const qrX = CARD_X + CARD_WIDTH / 2 - qrSize / 2;
  const qrY = cursorY - qrSize;
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  const scanLabel = 'SCAN TO CHECK IN';
  const scanLabelWidth = bold.widthOfTextAtSize(scanLabel, 9);
  page.drawText(scanLabel, {
    x: CARD_X + CARD_WIDTH / 2 - scanLabelWidth / 2,
    y: qrY - 18,
    size: 9,
    font: bold,
    color: GRAY_TEXT,
  });

  const ticketIdText = `Ticket ID: ${registration.ticket_id}`;
  const ticketIdWidth = regular.widthOfTextAtSize(ticketIdText, 7);
  page.drawText(ticketIdText, {
    x: CARD_X + CARD_WIDTH / 2 - ticketIdWidth / 2,
    y: CARD_Y + 14,
    size: 7,
    font: regular,
    color: GRAY_TEXT,
  });
}

export async function generateTicketsPdfBytes(registrations, { baseUrl = '' } = {}) {
  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const logoBytes = await loadLogoBytes(baseUrl);
  const logoImage = logoBytes ? await pdfDoc.embedPng(logoBytes) : null;

  for (const registration of registrations) {
    await drawTicketPage(pdfDoc, { bold, regular }, logoImage, registration);
  }

  return pdfDoc.save();
}

export async function generateTicketsPdf(registrations, options) {
  const pdfBytes = await generateTicketsPdfBytes(registrations, options);
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
