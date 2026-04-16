# SpyBot Website + Owner CMS

Public marketing website and in-repo owner dashboard (`/admin`) for full content and operations control.

## Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. Start PostgreSQL. **Recommended (Docker):** from the repo root run `docker compose up -d` — this starts Postgres with `postgres` / `postgres` and database `spybot` on **port 5433** (see `docker-compose.yml`). If you use your own Postgres instead, set `DATABASE_URL` accordingly (e.g. port `5432`).
3. Run:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

`pnpm dev` picks the first free port starting at **3000** (override with `DEV_BASE_PORT` or `PORT`) and uses a separate build folder per port (`.next/dev-port-<port>`) so Next.js 16’s dev lock does not block a second server when the default port is already taken.

Admin login is at `http://localhost:<port>/admin/login` (check the terminal for the exact URL).

## Client demo over the internet (Cloudflare Tunnel)

To show the site and CMS to someone **without deploying** (local DB stays local), use **Cloudflare Tunnel** and set **`NEXTAUTH_URL`** to the tunnel URL as documented in **[docs/cloudflare-tunnel.md](docs/cloudflare-tunnel.md)**.

## CMS Routes

- `/admin` dashboard overview
- `/admin/content` pages and sections
- `/admin/media` media assets
- `/admin/navigation` menu management
- `/admin/seo` SEO fields
- `/admin/forms` inquiries inbox
- `/admin/users` role management
- `/admin/settings` global settings
- `/admin/publish` publish queue
- `/admin/audit` audit history

## Security Baseline

- Session auth via NextAuth credentials.
- Route protection via `src/proxy.ts` for `/admin/*`.
- Role-based checks in admin API handlers.
- CSRF token verification for sensitive write paths.
- Basic in-memory request rate limiting in API guards.

## Deploying (e.g. Vercel)

- Set **`DATABASE_URL`** to a hosted Postgres (Neon, Supabase, etc.); run `pnpm db:push` / `pnpm db:seed` against it once. Add the same variable under **Vercel → Project → Settings → Environment Variables** for *Production* (and *Preview* if you use previews). The CMS segment is **`force-dynamic`**, so the build can complete even if you only add `DATABASE_URL` for runtime—but the admin UI will not load data until it is set.
- Set **`NEXTAUTH_URL`** to your production site origin (e.g. `https://your-app.vercel.app`) and **`NEXTAUTH_SECRET`** to a random string.
- The **`build`** script runs **`prisma generate`** before `next build`, and **`pnpm.onlyBuiltDependencies`** allows Prisma’s install scripts when using pnpm 10 (fixes “Ignored build scripts” on CI).

## Launch Checklist

- Configure production secrets: `NEXTAUTH_SECRET`, `CMS_CSRF_TOKEN`.
- Seed owner account with a strong password.
- Validate publishing and rollback workflows.
- Verify form ingestion and inbox operations.
- Run lint and type checks in CI.
