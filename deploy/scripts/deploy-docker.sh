#!/usr/bin/env bash
# Production deploy for Hostinger VPS (Docker Compose).
# Used by GitHub Actions self-hosted runner or manual:
#   cd /srv/Spybot && ./deploy/scripts/deploy-docker.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$ROOT/.env}"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE — copy from backup or .env.example"; exit 1; }

docker volume create spybot_pgdata 2>/dev/null || true

echo "==> Pull latest code (if git repo)"
git fetch origin main master 2>/dev/null || true
git checkout -q main 2>/dev/null || git checkout -q master 2>/dev/null || true
git pull --ff-only 2>/dev/null || true

echo "==> Build and start"
docker compose -f "$COMPOSE_FILE" up -d --build

echo "==> Wait for app"
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:3003/ >/dev/null 2>&1; then
    echo "Spybot is up on :3003"
    exit 0
  fi
  sleep 2
done

echo "WARN: health check timed out — check: docker compose -f $COMPOSE_FILE logs spybot"
exit 1
