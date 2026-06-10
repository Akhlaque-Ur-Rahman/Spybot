#!/bin/sh
set -e
cd /app

pnpm exec prisma generate

if ls prisma/migrations/*/migration.sql >/dev/null 2>&1; then
  pnpm exec prisma migrate deploy
elif [ "${PRISMA_PUSH_ON_BOOT:-0}" = "1" ]; then
  pnpm exec prisma db push
else
  echo "spybot: skipping schema sync (existing database)."
fi

exec pnpm start
