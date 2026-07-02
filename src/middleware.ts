import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE_NAME, SCANNER_SESSION_COOKIE_NAME, verifySessionToken } from './lib/adminAuth.js';

const PUBLIC_PATHS = new Set(['/console/login', '/scan/login']);

const GUARDED_AREAS = [
  { prefix: '/console', cookieName: SESSION_COOKIE_NAME, loginPath: '/console/login' },
  { prefix: '/scan', cookieName: SCANNER_SESSION_COOKIE_NAME, loginPath: '/scan/login' },
];

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  const area = GUARDED_AREAS.find((a) => pathname.startsWith(a.prefix));
  if (!area) {
    return next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return next();
  }

  const token = context.cookies.get(area.cookieName)?.value;
  if (!verifySessionToken(token)) {
    return context.redirect(area.loginPath);
  }

  return next();
});
