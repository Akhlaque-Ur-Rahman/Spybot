# SpyBot — Marketing site and owner CMS

Public marketing website and an authenticated **owner dashboard** at `/admin` for content, navigation, SEO, media, forms, users, publishing, and audit history. Content is stored in **PostgreSQL** via **Prisma**; static assets under `public/` (including `public/media`) ship with the app.

## What’s in the box

- **Public site**: Home, solutions, industries, resources, FAQ, support, contact, API marketplace, and CMS-driven pages (including dynamic routes such as `[...slug]`).
- **Admin (CMS)**: Page/section/block editing with draft vs live JSON, navigation menus, footer, global settings, SEO fields, media registry, form submissions inbox, users and roles, publish queue, and audit log.
- **Auth**: NextAuth.js with credentials provider and Prisma adapter; `src/proxy.ts` protects `/admin/*` except `/admin/login`.
- **Security baseline**: Session auth, role checks on admin APIs, CSRF verification on sensitive writes, and basic in-memory rate limiting in API guards.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js](https://nextjs.org/) **16.x** (App Router) |
| UI | [React](https://react.dev/) **19.x**, CSS modules, [GSAP](https://greensock.com/gsap/), [Lenis](https://lenis.darkroom.engineering/) |
| Database | [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/) **6.x** |
| Auth | [NextAuth.js](https://next-auth.js.org/) v4, [@auth/prisma-adapter](https://authjs.dev/reference/adapter/prisma) |
| Rich text (admin) | [Tiptap](https://tiptap.dev/) |
| Validation | [Zod](https://zod.dev/) |
| Package manager | **pnpm** `10.28.2` (see `package.json` → `packageManager`) |

Path alias: `@/*` → `src/*` (`tsconfig.json`).

## Prerequisites

- **Node.js 20+** (matches CI; LTS recommended).
- **pnpm** — use the version pinned in `package.json` or `corepack enable` / `corepack prepare pnpm@10.28.2 --activate`.
- **PostgreSQL** — local or remote; Docker Compose is provided for local dev (see below).

## Quick start

1. **Environment**  
   Copy [`.env.example`](.env.example) to `.env` or `.env.local` and set values. Next.js loads `.env.local` over `.env` when both exist.

2. **Database (recommended: Docker)**  
   From the repo root:

   ```bash
   docker compose up -d
   ```

   This starts PostgreSQL with user/password `postgres`, database `spybot`, on host port **5433** (see [`docker-compose.yml`](docker-compose.yml)). Point `DATABASE_URL` at it (as in `.env.example`), or use your own Postgres and adjust the URL (often port `5432`).

3. **Install and schema**

   ```bash
   pnpm install
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

   `postinstall` runs `prisma generate`. Seed creates/updates the owner user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` and baseline navigation/settings.

4. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open the **Local** URL printed in the terminal (not always `http://localhost:3000` if that port is busy). Admin login: `/admin/login`.

### Dev server: ports and build output

[`scripts/dev.mjs`](scripts/dev.mjs) picks the first free TCP port starting at `DEV_BASE_PORT` or `PORT` or **3000**, up to a configurable range (`DEV_PORT_RANGE`, default 100). It sets `NEXT_DIST_DIR` to `.next/dev-port-<port>` so a second dev instance does not conflict with Next.js 16’s dev lock on `.next`.

- Pin a single port (e.g. for Cloudflare Tunnel): set `DEV_STRICT_PORT=1` and `PORT=3000` (or your chosen port).
- [`next.config.ts`](next.config.ts) uses `NEXT_DIST_DIR` when set so the dev output matches the script.

## Environment variables

See [`.env.example`](.env.example) for comments. Summary:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Public origin of the app (must match the URL in the browser — critical behind tunnels or HTTPS) |
| `NEXTAUTH_SECRET` | Secret for signing sessions (use a long random value in production) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for absolute links / SEO (optional; defaults described in `.env.example`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Owner account used by `pnpm db:seed` |
| `CMS_CSRF_TOKEN` | Shared secret for CSRF on admin write APIs; optional in local dev, **set in shared/staging/production** |

## NPM scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Dev server via `scripts/dev.mjs` (port logic above) |
| `pnpm build` | `prisma generate` then `next build` |
| `pnpm start` | Production Next.js server (default port **3000**) |
| `pnpm lint` | ESLint |
| `pnpm test` | Runs all `*.test.ts` under `src/` via `tsx --test` ([`scripts/test.mjs`](scripts/test.mjs)) |
| `pnpm db:generate` | `prisma generate` |
| `pnpm db:push` | `prisma db push` (schema sync; no migration files in default workflow) |
| `pnpm db:seed` | Seed script [`prisma/seed.ts`](prisma/seed.ts) |

## Repository layout (high level)

- `src/app/` — App Router routes, layouts, and route handlers (`api/`, `admin/`, public pages).
- `src/components/` — Shared UI (marketing sections, admin shell, forms).
- `src/lib/` — Auth config, CMS helpers, Prisma-backed logic, security guards, notifications.
- `prisma/` — [`schema.prisma`](prisma/schema.prisma), seed.
- `public/` — Static files; **`public/media`** is the default place for shipped video/images referenced by the site.
- `deploy/` — Example [`spybot.service`](deploy/spybot.service) unit for production.
- `docs/` — Runbooks (production server, Civo, Cloudflare Tunnel).

## Data model (Prisma)

Notable models: `User` (roles `OWNER`, `EDITOR`, `REVIEWER`), `Page` / `Section` / `Block` (draft vs live JSON), `PageVersion`, `MediaAsset`, `NavigationMenu` / `NavItem`, `SiteSetting`, `FormSubmission`, `AuditLog`. See [`prisma/schema.prisma`](prisma/schema.prisma).

## Admin (CMS) routes

| Path | Area |
|------|------|
| `/admin` | Dashboard overview |
| `/admin/content` | Pages and sections |
| `/admin/media` | Media assets |
| `/admin/navigation` | Menus |
| `/admin/seo` | SEO fields |
| `/admin/forms` | Inquiry inbox |
| `/admin/users` | Users and roles |
| `/admin/settings` | Global settings |
| `/admin/footer` | Footer columns |
| `/admin/publish` | Publish queue |
| `/admin/audit` | Audit history |

API routes live under `src/app/api/` (e.g. NextAuth at `/api/auth/*`, admin APIs under `/api/admin/*`, contact form under `/api/forms/contact`).

## Client demo over the internet (Cloudflare Tunnel)

To share the local app without deploying, use Cloudflare Tunnel and set **`NEXTAUTH_URL`** to the tunnel URL. Step-by-step: **[docs/cloudflare-tunnel.md](docs/cloudflare-tunnel.md)**.

## CI and deploy

- **Workflow**: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — on pushes and PRs to `main`/`master`: `pnpm install --frozen-lockfile`, `pnpm db:push` against a service Postgres, `pnpm lint`, `pnpm test`, `pnpm build`.
- **Deploy** (optional): on push to `main`/`master`, if secrets `SSH_PRIVATE_KEY` and `DEPLOY_HOST` are set, rsync to the server and run install, `db:push`, `build`, and `systemctl restart spybot` when the unit exists. `.env` is **not** copied; configure the server separately.

Details and secret names: **[docs/civo-compute-instance.md](docs/civo-compute-instance.md)**.

## Deploying on a VPS (e.g. Civo)

Full runbook: **[docs/production-server.md](docs/production-server.md)** (DNS, Caddy TLS, systemd, environment, CORS notes).

Condensed expectations:

- Node 20+, pnpm, PostgreSQL on the host or managed; set `DATABASE_URL` for the running process.
- Build: `pnpm install --frozen-lockfile`, `pnpm db:push`, `pnpm db:seed` as needed, `pnpm build`; run `pnpm start` (port **3000**) behind a reverse proxy with HTTPS.
- Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CMS_CSRF_TOKEN`, `NEXT_PUBLIC_SITE_URL`, and strong admin credentials.
- Do not expose Postgres publicly; open **80**/**443** (and **22** for SSH) on the firewall.

### Pre-deploy checklist (self-hosted)

- [ ] **DNS**: A/AAAA records point to the server IP; no conflicting duplicate apex records.
- [ ] **TLS**: HTTPS at the proxy; HTTP → HTTPS redirect.
- [ ] **Postgres**: reachable only from the app; strong password; `DATABASE_URL` for the service user.
- [ ] **Schema**: `pnpm db:push` (or your migration process) applied to production.
- [ ] **Secrets**: `NEXTAUTH_SECRET`, `CMS_CSRF_TOKEN`; `NEXTAUTH_URL` matches the live origin exactly.
- [ ] **Site URL**: `NEXT_PUBLIC_SITE_URL` matches production.
- [ ] **Admin**: owner password strong; `/admin/login` works over HTTPS.
- [ ] **Static media**: `public/media` present on each deploy if you rely on on-disk assets.
- [ ] **Publishing / forms**: smoke-test CMS writes (CSRF) and form ingestion if used.
- [ ] **Vercel**: If you previously used Vercel, disconnect integrations and remove deploy hooks so nothing deploys there by mistake.

## Launch checklist

- Configure production secrets: `NEXTAUTH_SECRET`, `CMS_CSRF_TOKEN`.
- Seed or create owner with a strong password.
- Validate publishing and rollback workflows.
- Verify form ingestion and inbox if used.
- Keep lint and tests green in CI.

## Related documentation

| Document | Contents |
|----------|----------|
| [docs/production-server.md](docs/production-server.md) | Civo/VPS, Caddy, systemd, env, GitHub Actions, hardening |
| [docs/civo-compute-instance.md](docs/civo-compute-instance.md) | Instance setup, deploy secrets, `spybot.service` |
| [docs/cloudflare-tunnel.md](docs/cloudflare-tunnel.md) | Temporary public URL for local dev demos |

## Next.js version note

This project targets **Next.js 16** with conventions that may differ from older docs. When changing framework behavior, prefer the guides under `node_modules/next/dist/docs/` in this repo and watch for deprecations.
