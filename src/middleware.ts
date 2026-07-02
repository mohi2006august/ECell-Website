import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/adminAuth.js';

const PUBLIC_CONSOLE_PATHS = new Set(['/console/login']);

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/console')) {
    return next();
  }

  if (PUBLIC_CONSOLE_PATHS.has(pathname)) {
    return next();
  }

  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return context.redirect('/console/login');
  }

  return next();
});
