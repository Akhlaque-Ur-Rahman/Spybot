<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Spybot production and HTML5 video

- **Ship changes:** push to `main` → GitHub Actions (`.github/workflows/ci.yml`) → rsync + `pnpm build` on the server + `systemctl restart spybot` when deploy secrets and `spybot.service` exist. Not Vercel — see `docs/production-server.md`. If the server clone cannot `git push` (no GitHub key), build + `systemctl restart spybot` on the server after applying commits locally; push from a dev machine for GitHub to stay in sync.
- **`<video>` right-click menu:** browser default; use client-side `onContextMenu` → `preventDefault`, plus `draggable={false}` / `disablePictureInPicture` as needed. Details: `.cursor/rules/html5-video-and-spybot-release.mdc`.
