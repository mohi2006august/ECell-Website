import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

const PAGE_WIDTH = 1000;
const PAGE_HEIGHT = 650;
const MARGIN = 38;

const CARD_X = MARGIN;
const CARD_Y = MARGIN;
const CARD_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CARD_HEIGHT = PAGE_HEIGHT - MARGIN * 2;

const BLACK = rgb(0.02, 0, 0);
const DARK_RED = rgb(0.16, 0.02, 0.015);
const RED_LEFT = rgb(0.52, 0.17, 0.18);
const RED_LINE = rgb(0.42, 0.18, 0.15);
const WHITE = rgb(1, 1, 1);
const SOFT_WHITE = rgb(1, 0.94, 0.94);
const MUTED_RED = rgb(0.98, 0.66, 0.66);
const GREEN = rgb(0.13, 0.77, 0.37);

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawHorizontalGradient(page, x, y, width, height, from, to) {
  const steps = 110;
  const stepWidth = width / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    page.drawRectangle({
      x: x + i * stepWidth,
      y,
      width: stepWidth + 0.5,
      height,
      color: rgb(
        lerp(from.red, to.red, t),
        lerp(from.green, to.green, t),
        lerp(from.blue, to.blue, t)
      ),
    });
  }
}

function drawSubtleStripes(page, x, y, width, height) {
  for (let stripeX = x + 8; stripeX < x + width; stripeX += 8) {
    page.drawLine({
      start: { x: stripeX, y },
      end: { x: stripeX, y: y + height },
      thickness: 0.35,
      color: rgb(0.32, 0.12, 0.1),
      opacity: 0.42,
    });
  }
}

function fitText(font, text, size, maxWidth) {
  const safeText = String(text ?? '');
  if (font.widthOfTextAtSize(safeText, size) <= maxWidth) return safeText;
  let truncated = safeText;
  while (truncated.length > 1 && font.widthOfTextAtSize(`${truncated}...`, size) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}...`;
}

async function drawTicketPage(pdfDoc, fonts, registration) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { bold, regular } = fonts;
  const event = registration.events ?? {};

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: BLACK });

  drawHorizontalGradient(page, CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, RED_LEFT, BLACK);
  page.drawRectangle({
    x: CARD_X,
    y: CARD_Y,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderColor: RED_LINE,
    borderWidth: 1.1,
  });
  drawSubtleStripes(page, CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT);
  page.drawRectangle({
    x: CARD_X,
    y: CARD_Y,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    color: DARK_RED,
    opacity: 0.16,
  });

  const contentX = CARD_X + 26;
  const topY = CARD_Y + CARD_HEIGHT - 40;

  page.drawText('E-CELL VJIT PASS', {
    x: contentX,
    y: topY,
    size: 10,
    font: bold,
    color: SOFT_WHITE,
  });

  const liveX = CARD_X + CARD_WIDTH - 94;
  const liveY = topY - 8;
  page.drawRectangle({
    x: liveX,
    y: liveY,
    width: 62,
    height: 30,
    borderColor: RED_LINE,
    borderWidth: 1,
    color: rgb(0.12, 0.04, 0.03),
    opacity: 0.78,
  });
  page.drawCircle({ x: liveX + 15, y: liveY + 15, size: 4.5, color: GREEN });
  page.drawText('LIVE', { x: liveX + 25, y: liveY + 11, size: 8, font: bold, color: WHITE });

  page.drawText(fitText(bold, String(event.title ?? 'Event').toUpperCase(), 34, 560), {
    x: contentX,
    y: topY - 50,
    size: 34,
    font: bold,
    color: WHITE,
  });

  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const meta = fitText(regular, [dateStr, event.time, event.venue].filter(Boolean).join(' - '), 14, 560);

  page.drawText(fitText(bold, registration.name ?? 'Attendee', 42, 560), {
    x: contentX,
    y: CARD_Y + 252,
    size: 42,
    font: bold,
    color: WHITE,
  });
  page.drawText(meta, { x: contentX, y: CARD_Y + 218, size: 14, font: bold, color: SOFT_WHITE });

  const qrDataUrl = await QRCode.toDataURL(registration.ticket_id, { width: 500, margin: 1 });
  const qrBytes = await fetch(qrDataUrl).then((r) => r.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrBytes);

  const qrSize = 270;
  const qrPadding = 18;
  const qrBox = qrSize + qrPadding * 2;
  const qrX = CARD_X + CARD_WIDTH - qrBox - 26 + qrPadding;
  const qrY = CARD_Y + 226;
  page.drawRectangle({
    x: qrX - qrPadding,
    y: qrY - qrPadding,
    width: qrBox,
    height: qrBox,
    color: WHITE,
  });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  const cutY = CARD_Y + 184;
  page.drawLine({
    start: { x: CARD_X, y: cutY },
    end: { x: CARD_X + CARD_WIDTH, y: cutY },
    thickness: 1,
    color: RED_LINE,
    opacity: 0.8,
  });
  page.drawCircle({ x: CARD_X, y: cutY, size: 14, color: BLACK });
  page.drawCircle({ x: CARD_X + CARD_WIDTH, y: cutY, size: 14, color: BLACK });

  const fieldTop = CARD_Y + 150;
  const fields = [
    { label: 'EMAIL', value: registration.email, x: contentX, y: fieldTop, width: 340 },
    { label: 'PHONE', value: registration.phone || 'Not provided', x: contentX + 370, y: fieldTop, width: 170 },
    { label: 'TEAM', value: registration.team_name || 'Solo', x: contentX + 570, y: fieldTop, width: 300 },
    { label: 'TICKET ID', value: registration.ticket_id, x: contentX, y: fieldTop - 62, width: 830 },
  ];

  for (const field of fields) {
    page.drawText(field.label, { x: field.x, y: field.y, size: 9, font: bold, color: MUTED_RED });
    page.drawText(fitText(bold, field.value, 13, field.width), {
      x: field.x,
      y: field.y - 28,
      size: 13,
      font: bold,
      color: WHITE,
    });
  }
}

export async function generateTicketsPdfBytes(registrations) {
  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const registration of registrations) {
    await drawTicketPage(pdfDoc, { bold, regular }, registration);
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
