// Server-only. Never import this from client-side code.
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'ecell_console_session';
// Separate cookie for /scan — same shared password, but its own session so a
// console login doesn't imply scanner access or vice versa.
export const SCANNER_SESSION_COOKIE_NAME = 'ecell_scanner_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSessionSecret() {
  const secret = import.meta.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  return secret;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export async function verifyAdminPassword(password) {
  // Stored base64-encoded: dotenv-expand (Vite's .env loader) interprets `$`
  // as variable interpolation, which mangles raw bcrypt hashes like $2b$12$...
  const encodedHash = import.meta.env.ADMIN_PASSWORD_HASH_B64;
  if (!encodedHash || !password) return false;
  const hash = Buffer.from(encodedHash, 'base64').toString('utf-8');
  return bcrypt.compare(password, hash);
}

export function createSessionToken() {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;

  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = sign(encodedPayload);

  const sigBuffer = Buffer.from(signature ?? '');
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}
