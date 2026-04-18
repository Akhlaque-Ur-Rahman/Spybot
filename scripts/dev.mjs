import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

const basePort = Math.max(1, Number.parseInt(process.env.DEV_BASE_PORT ?? process.env.PORT ?? '3000', 10) || 3000);
const maxAttempts = Math.max(1, Number.parseInt(process.env.DEV_PORT_RANGE ?? '100', 10) || 100);
const strictPort = ['1', 'true', 'yes'].includes(String(process.env.DEV_STRICT_PORT ?? '').toLowerCase());

/**
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.once('error', () => resolve(false));
    // Omit host so Node matches the default dual-stack bind Next uses (avoids false "free" on :: when only 0.0.0.0 was checked).
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findFreePort() {
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free TCP port in range ${basePort}–${basePort + maxAttempts - 1}`);
}

/**
 * With DEV_STRICT_PORT=1, only `basePort` is used (must be free). Use this when using
 * Cloudflare quick tunnels: `cloudflared tunnel --url http://localhost:<same port>`.
 */
async function resolvePort() {
  if (strictPort) {
    if (!(await isPortFree(basePort))) {
      throw new Error(
        `DEV_STRICT_PORT is set but port ${basePort} is not free. Stop whatever is using it ` +
          `(other Next dev, Docker, etc.) or unset DEV_STRICT_PORT. ` +
          `Tunnel must target the same port, e.g. cloudflared tunnel --url http://localhost:${basePort}`
      );
    }
    return basePort;
  }
  return findFreePort();
}

async function main() {
  const port = await resolvePort();
  const distDir = path.join('.next', `dev-port-${port}`);

  const env = {
    ...process.env,
    PORT: String(port),
    NEXT_DIST_DIR: distDir,
  };

  const origin = `http://localhost:${port}`;
  console.log(`\n  Local:   ${origin}`);
  if (strictPort) {
    console.log(`  Port:    strict (${port}) — DEV_STRICT_PORT=1`);
  }
  console.log(
    `  Tunnel:  cloudflared tunnel --url ${origin}\n` +
      `           (must match this port; if you use trycloudflare, set NEXTAUTH_URL to that https URL)\n`
  );

  const child = spawn(process.execPath, [nextBin, 'dev', '-p', String(port)], {
    cwd: root,
    env,
    stdio: 'inherit',
    windowsHide: true,
  });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
