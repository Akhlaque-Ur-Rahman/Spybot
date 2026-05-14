#!/bin/sh
set -e
cd /app

pnpm exec prisma generate

if ls prisma/migrations/*/migration.sql >/dev/null 2>&1; then
  pnpm exec prisma migrate deploy
elif [ "${PRISMA_PUSH_ON_BOOT:-0}" = "1" ]; then
  pnpm exec prisma db push
else
  echo "spybot: no prisma/migrations/*/migration.sql and PRISMA_PUSH_ON_BOOT is not 1."
  echo "Set PRISMA_PUSH_ON_BOOT=1 for first-boot schema sync (this repo often uses db push), or add migrations and use migrate deploy."
  exit 1
fi

exec pnpm start
