# TODO

## Incomplete / left to do

1. **Events page** — currently an empty placeholder ("this space is intentionally empty"). Needs real event content, and the "register" CTA points to `/events#register`, which doesn't exist yet.
2. **Community page** — just a "coming soon" landing page, no actual feature built.
3. **No forms anywhere** — no contact form, no newsletter signup, no event registration. Nothing on the site can currently collect user input.
4. **SEO basics missing** — no favicon, no meta description, no Open Graph/Twitter card tags, no `sitemap.xml`, no `robots.txt`.
5. **No tests** — zero test files or test setup (Jest/Vitest/Playwright/Cypress).
6. **No CI/CD** — no `.github/workflows`, no committed `vercel.json`/`netlify.toml`.
7. **No README** — nothing documenting setup, scripts, or contribution process.

## Suggested improvements, by effort

### Quick wins
- Add favicon, meta description, Open Graph/Twitter tags to `src/layouts/BaseLayout.astro`
- Add `@astrojs/sitemap` integration + `robots.txt`
- Add a root `README.md` with setup/dev/build instructions

### Medium effort
- Add a GitHub Actions workflow to verify `astro build` succeeds on PRs
- Populate the Events page with real/upcoming event data (reuse the CSV→JSON pattern used for team data)

## Planned architecture (from project wiki)

The team has already decided on the stack for the backend/services work below — see the GitHub wiki "Home" page for the full writeup. Summary:

| Category | Tool / Tech |
|---|---|
| Frontend | Astro |
| Hosting | Vercel |
| Backend | Node.js (Vercel Serverless Functions; AWS EC2 as fallback if scaling needed) |
| Database | Supabase (PostgreSQL) |
| Email | Resend (ticket delivery, registration confirmations) |
| File storage | Cloudflare R2 (generated ticket PDFs, backups) |
| Image storage | Cloudinary (event posters, media, CDN) |
| QR generation | `qrcode` (Node.js) |
| PDF/ticket generation | `pdf-lib` (lightweight) or `puppeteer` (advanced layouts) |
| QR scanner (event desk) | Web-based `/scan` route using `html5-qrcode` or `zxing-js` — no app install needed |
| Analytics | Cloudflare Web Analytics (privacy-friendly, no cookies) |
| Domain | Hostinger / Namecheap (avoid GoDaddy) |
| CI/CD | GitHub Actions |

### Registration/ticketing flow (once built)
1. User registers for an event → record created in Supabase
2. Unique QR code generated per registration
3. QR embedded in a ticket PDF, emailed via Resend
4. Ticket PDF stored in Cloudflare R2
5. At the event, staff scan tickets via the web-based `/scan` route

### Future / not yet scoped for near-term work
- Full authentication system (Supabase Auth, role-based access for admin dashboard)
- Admin dashboard (custom Astro+API build, or just use Supabase's dashboard for internal use)
- Payment gateway — Razorpay (India)
- CAPTCHA / spam protection on registrations, rate limiting
- External logging/monitoring service (console logging is fine for now)
- Mobile scanner app (Flutter) as an alternative to the web scanner
- Notification system
- Google Search Console setup once SEO basics are in place

This section supersedes the generic "form-as-a-service" suggestion from earlier drafts of this file — the team already has a concrete plan (Supabase + Resend + Cloudflare R2) rather than needing a third-party form tool.
