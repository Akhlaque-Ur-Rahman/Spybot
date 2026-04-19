# Production server (Civo VPS + domain)

Reference for the **Spybot** stack: Ubuntu, PostgreSQL, Next.js (`pnpm start`), **Caddy** (HTTPS), **systemd**, **GitHub Actions** deploy, **GoDaddy** DNS.

Also see **[civo-compute-instance.md](./civo-compute-instance.md)** for first-boot steps and deploy secrets.

---

## Architecture

| Layer | Role |
|-------|------|
| **Internet** | Users hit **443** (HTTPS) and **80** (HTTP → redirect). |
| **Caddy** | TLS termination (Let’s Encrypt), reverse proxy to the app. |
| **Next.js** | `pnpm start` on **127.0.0.1:3000** — not required to be open on the public internet. |
| **PostgreSQL** | On the same VM; `DATABASE_URL` uses `localhost:5432`. |
| **systemd** | `spybot.service` keeps `pnpm start` running after reboot. |

Traffic flow: `Browser → :443 → Caddy (TLS) → http://127.0.0.1:3000 → Next.js`.

---

## TLS / SSL certificates

- **No separate paid SSL product is required** when using **Caddy + Let’s Encrypt** (free, auto-renewed certificates).
- **GoDaddy “SSL certificate”** is optional; common for shared hosting, not required for this setup.
- If Let’s Encrypt shows **HTTP 429 (rate limit)**, wait for the **retry-after** window (often ~1 hour) after fixing DNS — too many failed validations while DNS was wrong causes this.

---

## DNS (e.g. GoDaddy)

- **`@` (apex)** and **`www`**: each should have **one** **A** record to the **Civo public IP**. Remove **duplicate** A records (e.g. a second `@` pointing at a **parking** IP like `184.168.x.x`) — duplicates break Let’s Encrypt **secondary validation**.
- **`admin` / `api`** subdomains: point to the same server IP if they should serve this app; remove or update old parking IPs.
- **AAAA (IPv6):** only if you know the correct target; a wrong AAAA can cause odd HTTPS behaviour on some networks.
- After changes, verify: `nslookup yourdomain` → should show only your server IP for the names you use.

---

## Caddy

- **Install:** official Caddy apt repo (see [caddyserver.com/docs/install](https://caddyserver.com/docs/install)).
- **Config:** `/etc/caddy/Caddyfile` — e.g. `spybots.in, www.spybots.in { reverse_proxy 127.0.0.1:3000 }`.
- **Reload:** `sudo systemctl reload caddy`.
- **Logs:** `sudo journalctl -u caddy -n 50 --no-pager`.

Optional: redirect **apex → www** (or the reverse) in Caddy if you want a single canonical hostname.

---

## Application environment (`/var/www/Spybot/.env`)

Set on the server only (not committed; deploy **excludes** `.env`).

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL on `localhost:5432`. |
| `NEXTAUTH_URL` | **Exact** public origin users use (e.g. `https://spybots.in`) — must match the browser URL or logins redirect wrong (e.g. to `localhost`). |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for absolute links / SEO. |
| `NEXTAUTH_SECRET`, `CMS_CSRF_TOKEN`, `ADMIN_*` | As in `.env.example`. |

After edits: `sudo systemctl restart spybot`.

---

## systemd (`deploy/spybot.service`)

- Copy to `/etc/systemd/system/spybot.service`, then `sudo systemctl daemon-reload && sudo systemctl enable --now spybot`.
- CI deploy: allow `sudo systemctl restart spybot` without a password for `ubuntu` (see **civo-compute-instance.md**).

---

## CORS

- **This app does not configure browser CORS headers** in code (`next.config` has no CORS; no `Access-Control-*` middleware was added).
- **Same-origin** use (website + `/admin` + `/api` on the same domain) does **not** require CORS.
- Add CORS only if you need **another origin** (e.g. `https://other-site.com`) to call your APIs from the browser — not needed for the standard public site + CMS on one domain.

---

## Browser notes

- If **HTTPS** works in **curl** but fails in **Brave** with `ERR_SSL_PROTOCOL_ERROR`, try **Incognito** or clear **site data** for that host — stale cache/HSTS after certificate or DNS changes can cause that.

---

## GitHub Actions

- Workflow: `.github/workflows/ci.yml` — CI + optional deploy over SSH (see **civo-compute-instance.md** for secrets).
- **`SSH_PRIVATE_KEY`:** must be the **private** key (e.g. contents of `id_ed25519`), **not** the `.pub` file.

---

## Hardening (optional)

- **Civo firewall:** restrict to **22**, **80**, **443**; do not expose **3000** publicly.
- Rotate secrets if exposed; use a strong **admin** password in production.
