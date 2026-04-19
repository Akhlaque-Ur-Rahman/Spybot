# Civo compute instance — essentials and post-creation

For the full production picture (Caddy, DNS, TLS, CORS, systemd), see **[production-server.md](./production-server.md)**.

## What to record at creation time

- **Region** (e.g. mum1) and **instance name** (e.g. Spybot).
- **Size** (e.g. g4s.medium: 2 vCPU, 4 GB RAM, disk size).
- **OS** (e.g. Ubuntu 22.04) and **initial user** (e.g. `ubuntu`).
- **Public IP** — create/assign one; note **Reserved IP** if you use it so DNS does not break later.
- **Firewall** — which profile is attached (`default-default` or a custom rule set). For HTTPS you need **22** (SSH), **80**, **443** open to the internet (or stricter sources if you lock SSH).
- **SSH key** — name in Civo (e.g. the key used at create time); you need the matching **private key** on your laptop to connect.

## After the instance is running

1. **Get connection details** — open the instance in the dashboard; copy **public IP** (and use **View SSH information** for user, e.g. `ubuntu`).
2. **SSH in** — `ssh -i /path/to/private.key ubuntu@PUBLIC_IP` (or your key agent). Confirm login works before changing DNS.
3. **Firewall sanity** — in Civo, confirm inbound **80** and **443** (and **22** for you). If the site will not load later, fix the cloud firewall first, not only `ufw` on the VM.
4. **OS updates** — `sudo apt update && sudo apt upgrade -y` (reboot if the kernel changed).
5. **Optional host firewall** — if you enable `ufw`: allow `OpenSSH`, then `80`, `443`, enable `ufw`; do not lock yourself out of SSH.
6. **Install runtime** — Node **20+** (LTS), **pnpm** (see repo `packageManager` in `package.json`), **git**.
7. **PostgreSQL** — install on the same VM **or** point `DATABASE_URL` at Civo Managed Database. For local Postgres: create a database and user, restrict Postgres to `localhost`.
8. **App deploy** — clone the repo (or upload build artifacts), copy env from `.env.example`, set at least `DATABASE_URL`, `NEXTAUTH_URL` (your real `https://` origin), `NEXTAUTH_SECRET`, `NEXTAUTH_SECRET`-style `CMS_CSRF_TOKEN`, `NEXT_PUBLIC_SITE_URL`, admin vars. Run `pnpm install --frozen-lockfile`, `pnpm db:push`, `pnpm db:seed` if needed, `pnpm build`, then `pnpm start` (port **3000** by default).
9. **Process supervision** — run the app under **systemd** or **pm2** so it restarts on reboot.
10. **Reverse proxy + TLS** — put **Caddy** or **nginx** in front on **80/443**, proxy to `127.0.0.1:3000`, obtain certificates (Let’s Encrypt). HTTP → HTTPS redirect.
11. **DNS** — point your domain **A/AAAA** to the instance (or reserved) IP; wait for propagation; set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to match.
12. **Backups** — plan DB backups (dump/cron or managed DB backups) and snapshot/restore strategy for `public/media` if you add files on disk.

## GitHub Actions deploy (`.github/workflows/ci.yml`)

On **push** to `main` or `master`, CI runs (lint, test, build with ephemeral Postgres), then **deploy** rsyncs the repo to the server and runs `pnpm install`, `pnpm db:push`, `pnpm build`, and `sudo systemctl restart spybot` if the unit exists.

**Repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Required | Example |
|--------|----------|---------|
| `SSH_PRIVATE_KEY` | Yes | Private key whose **public** key is in `ubuntu@server:~/.ssh/authorized_keys` |
| `DEPLOY_HOST` | Yes | Server IP or hostname (e.g. `212.2.250.167`) |
| `DEPLOY_USER` | No | Default `ubuntu` |
| `DEPLOY_PATH` | No | Default `/var/www/Spybot` |

**Server once:** install `deploy/spybot.service` → `/etc/systemd/system/spybot.service`, then `sudo systemctl daemon-reload && sudo systemctl enable --now spybot`. Allow passwordless restart for CI: e.g. `sudo visudo -f /etc/sudoers.d/spybot-deploy` with `ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl restart spybot`.

Deploy does **not** upload `.env`; keep production env only on the server.

## Quick verification

- `https://your-domain/` loads the site.
- `https://your-domain/admin/login` works over HTTPS.
- After reboot, the app and Postgres come back (systemd/pm2 + Postgres enabled).
