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
- `/admin/footer` footer columns
- `/admin/publish` publish queue
- `/admin/audit` audit history

## Security Baseline

- Session auth via NextAuth credentials.
- Route protection via `src/proxy.ts` for `/admin/*`.
- Role-based checks in admin API handlers.
- CSRF token verification for sensitive write paths.
- Basic in-memory request rate limiting in API guards.

## Deploying on a Civo VM (or similar VPS)

**Full server runbook (DNS, Caddy, TLS, systemd, CORS):** [docs/production-server.md](docs/production-server.md).

Provision a Linux instance from [Civo](https://dashboard.civo.com) (or any VPS), point DNS at its public IP, and run the app behind HTTPS (Caddy, nginx, or a load balancer). **Media** shipped in `public/media` is served by the same Node process as the site; no separate object store is required unless you later move large files off the box.

- Install **Node 20+**, **pnpm**, and clone this repo on the server (or deploy build artifacts from CI).
- Run **PostgreSQL** on the same machine or as a managed DB; set **`DATABASE_URL`** in the process environment (not only in a shell profile). Run `pnpm db:push` and `pnpm db:seed` once against that database from a trusted environment.
- Set **`NEXTAUTH_URL`** to the public origin browsers use (e.g. `https://your-domain.com`, including scheme, no trailing slash). Set **`NEXTAUTH_SECRET`**, **`CMS_CSRF_TOKEN`**, and **`NEXT_PUBLIC_SITE_URL`** to your canonical HTTPS origin for SEO and absolute URLs.
- Build and run: `pnpm install --frozen-lockfile`, `pnpm build`, then `pnpm start` (default port **3000**) under **systemd**, **pm2**, or similar. Terminate TLS at the reverse proxy and proxy to `127.0.0.1:3000`.
- Open firewall ports **80** and **443** (and **22** for SSH); do not expose Postgres to the public internet if it runs on the same VM.
- The **`build`** script runs **`prisma generate`** before `next build`, and **`pnpm.onlyBuiltDependencies`** allows Prisma’s install scripts when using pnpm 10 (fixes “Ignored build scripts” on CI).

### Pre-deploy checklist (Civo / self-hosted)

- [ ] **DNS**: A/AAAA records for your domain point to the instance IP.
- [ ] **TLS**: HTTPS certificates installed at the reverse proxy; HTTP → HTTPS redirect.
- [ ] **Postgres**: reachable from the app with a strong password; `DATABASE_URL` set for the `pnpm start` process.
- [ ] **Migrations/schema**: `pnpm db:push` (or your migration workflow) applied once to production DB.
- [ ] **Secrets**: `NEXTAUTH_SECRET`, `CMS_CSRF_TOKEN` set; `NEXTAUTH_URL` matches the live origin exactly.
- [ ] **Site URL**: `NEXT_PUBLIC_SITE_URL` matches production (VideoObject and absolute links).
- [ ] **Admin**: seed or create owner with a strong password; confirm `/admin/login` over HTTPS.
- [ ] **Static media**: `public/media` present on the server in every deploy (same tree as the build); redeploys replace files—back up anything you add manually on disk.
- [ ] **Publishing**: validate publish/rollback and CMS write paths (CSRF) in production.
- [ ] **Forms**: verify form ingestion and inbox if you use them.
- [ ] **Vercel**: disconnect the Git integration or delete the Vercel project, remove Vercel env vars from your secrets store, and revoke any Vercel deploy hooks so nothing deploys there by mistake.

## Launch Checklist

- Configure production secrets: `NEXTAUTH_SECRET`, `CMS_CSRF_TOKEN`.
- Seed owner account with a strong password.
- Validate publishing and rollback workflows.
- Verify form ingestion and inbox operations.
- Run lint and type checks in CI.
