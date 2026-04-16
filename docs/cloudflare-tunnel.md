# Client demo with Cloudflare Tunnel

Expose your **local** Next.js app (and local Postgres) to the internet over HTTPS so a client can open a link in their browser. Traffic flows: **client → Cloudflare → cloudflared on your machine → localhost**.

For **NextAuth v4**, set **`NEXTAUTH_URL`** to your public tunnel URL so callbacks and cookies match what the browser uses. See [NextAuth.js deployment](https://next-auth.js.org/deployment).

## Prerequisites

- App runs locally: `pnpm dev` (note the **port** in the terminal, e.g. `http://localhost:3000`).
- Postgres reachable from that same machine (e.g. `docker compose up -d` and `DATABASE_URL` in `.env.local`).
- [Cloudflare `cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed and available on your `PATH`.

## Quick demo (temporary URL)

Best for a **short** client call. Cloudflare gives you a random `*.trycloudflare.com` hostname each run.

1. Start the app:

   ```bash
   pnpm dev
   ```

   Use the **Local** URL from the output (e.g. `http://localhost:3000`). If the port is not `3000`, use that port in the next step.

2. In a **second** terminal, from the repo root (or anywhere), run:

   ```bash
   cloudflared tunnel --url http://127.0.0.1:3000
   ```

   Replace `3000` with your dev port if different.

3. `cloudflared` prints an **HTTPS** URL like `https://random-words.trycloudflare.com`. Copy it exactly (no trailing slash required).

4. Update **`.env.local`** (create from [`.env.example`](../.env.example) if needed):

   ```env
   NEXTAUTH_URL="https://random-words.trycloudflare.com"
   ```

   Keep `DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_*`, and `CMS_CSRF_TOKEN` as they are for local dev.

5. **Restart** `pnpm dev` so Next.js and NextAuth pick up the new env.

6. Send the client:

   - Site: `https://random-words.trycloudflare.com`
   - CMS login: `https://random-words.trycloudflare.com/admin/login`

7. When the demo is over, stop `cloudflared` (Ctrl+C), revert `NEXTAUTH_URL` to your local origin, and restart `pnpm dev`.

### Why change `NEXTAUTH_URL`?

NextAuth uses this for callbacks and cookie configuration. It must match the **public** origin the browser uses (the tunnel URL), not `http://localhost:...`.

## Optional: stable hostname (named tunnel)

For repeated demos or a semi-stable URL, use a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/) in the Cloudflare dashboard, route DNS to the tunnel, and set **`NEXTAUTH_URL`** to that hostname (same as for quick tunnels).

## Security notes (read before sharing a link)

- Anyone with the URL can hit your machine while the tunnel is up. Use a **strong** `ADMIN_PASSWORD` and set **`CMS_CSRF_TOKEN`** for write APIs.
- Quick tunnels are **public**; do not leave them running overnight with weak credentials.
- This is for **demos**, not a substitute for production hosting (Vercel + Neon, etc.).

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| Login works locally but not via tunnel | Confirm `NEXTAUTH_URL` equals the tunnel URL **including `https://`**, then restart the dev server. |
| Redirect loops or wrong host | Same as above; ensure only one tunnel points at the port `pnpm dev` uses. |
| CSRF errors on save in CMS | `CMS_CSRF_TOKEN` must be set in `.env.local`; restart after changes. The admin UI sends the token from the server-rendered shell. |
| Wrong port | `cloudflared tunnel --url` must match **127.0.0.1:&lt;port&gt;** from `pnpm dev` output. |

## Reference: environment variables

| Variable | Local dev | With tunnel |
|----------|-----------|-------------|
| `NEXTAUTH_URL` | `http://localhost:<port>` | `https://<your-tunnel-host>` |
| `DATABASE_URL` | unchanged (still local Postgres) | unchanged |
