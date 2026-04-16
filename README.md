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

## Launch Checklist

- Configure production secrets: `NEXTAUTH_SECRET`, `CMS_CSRF_TOKEN`.
- Seed owner account with a strong password.
- Validate publishing and rollback workflows.
- Verify form ingestion and inbox operations.
- Run lint and type checks in CI.
