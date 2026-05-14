# Spybot on Hostinger VPS (with vahan360 + Caddy)

This repo ships a **Docker image** and a **small compose file** so Spybot runs on the **same Docker network** as vahan360’s **Caddy** edge. TLS for `spybots.in` is obtained by **adding a site block** to vahan360’s existing Caddyfile (do not run a second reverse proxy on ports 80/443).

## 1) Postgres: second database in the same container (recommended here)

Use the **existing** vahan360 Postgres container. From the host:

```bash
docker exec -it vahan360-postgres psql -U "${V360_POSTGRES_USER:-vahan360}" -d postgres
```

In `psql` (replace passwords):

```sql
CREATE USER spybot WITH PASSWORD 'choose_a_strong_password';
CREATE DATABASE spybot OWNER spybot;
GRANT ALL PRIVILEGES ON DATABASE spybot TO spybot;
\q
```

Inside Docker (Spybot container on `vahan360-network`), the hostname is the **compose service name** `postgres`, not `localhost`:

```env
DATABASE_URL="postgresql://spybot:choose_a_strong_password@postgres:5432/spybot?schema=public"
```

## 2) Spybot production env (repo root `.env.production`)

Copy from [.env.example](../.env.example) and set at least:

- `DATABASE_URL` — as above (Docker network hostname `postgres`).
- `NEXTAUTH_URL` — `https://spybots.in` (must match the browser URL exactly).
- `NEXTAUTH_SECRET` — long random secret.
- `NEXT_PUBLIC_SITE_URL` — `https://spybots.in` (canonical URLs).
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CMS_CSRF_TOKEN` — per [.env.example](../.env.example).

Do **not** commit `.env.production`.

## 3) Join the vahan360 Docker network

List networks and pick the one vahan360 Caddy uses (often `<project>_vahan360-network`):

```bash
docker network ls
```

Copy [deploy/spybot.compose.env.example](./spybot.compose.env.example) to `deploy/spybot.compose.env` and set `V360_EDGE_NETWORK` to that exact name.

## 4) Build and start Spybot

From the **spybot repo root** on the server:

```bash
docker compose --env-file deploy/spybot.compose.env -f deploy/docker-compose.spybot.yml up -d --build
```

First boot uses `PRISMA_PUSH_ON_BOOT=1` (see [deploy/docker-compose.spybot.yml](./docker-compose.spybot.yml)) because this repo commonly uses `prisma db push` without a `prisma/migrations` tree. When you add migrations, switch to `prisma migrate deploy` and remove `PRISMA_PUSH_ON_BOOT`.

Optional seed (once):

```bash
docker compose --env-file deploy/spybot.compose.env -f deploy/docker-compose.spybot.yml exec spybot pnpm db:seed
```

## 5) Caddy + HTTPS for spybots.in

1. Point **DNS** `spybots.in` (A/AAAA) at this server’s public IP.
2. Merge the site block from [deploy/caddy-spybot.snippet.caddyfile](./caddy-spybot.snippet.caddyfile) into vahan360’s `deploy/caddy/Caddyfile`.
3. Reload vahan360 Caddy (however you usually apply compose changes), e.g.:

```bash
cd /path/to/vahan360 && docker compose up -d caddy
```

Caddy will issue a Let’s Encrypt certificate for `spybots.in` once DNS and port 80/443 reachability are correct.

## 6) Port / conflict checklist

- **80/443** — only vahan360 **Caddy** should publish these.
- **3001, 15432, 6379** — vahan360 services; Spybot compose does **not** publish host ports.
- If you enable vahan360 **`obs` profile**, Grafana may use host **3002**; keep Spybot internal-only (no clash).

## 7) Verify

```bash
docker compose --env-file deploy/spybot.compose.env -f deploy/docker-compose.spybot.yml ps
docker compose --env-file deploy/spybot.compose.env -f deploy/docker-compose.spybot.yml logs -f spybot
```

Open `https://spybots.in` and confirm admin login. If NextAuth redirects fail, recheck `NEXTAUTH_URL` matches the public HTTPS origin exactly.
