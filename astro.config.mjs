import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [tailwind()],
  security: {
    // Vercel can proxy form submissions with forwarded host/protocol metadata
    // that fails Astro's same-origin POST guard for server-rendered routes.
    checkOrigin: false,
  },
  // Site stays fully static by default. The adapter only enables on-demand
  // rendering for routes that explicitly opt in via `export const prerender = false`
  // (currently just src/pages/api/send-ticket-email.ts).
  adapter: vercel(),
  server: {
    host: true,
  },
});
