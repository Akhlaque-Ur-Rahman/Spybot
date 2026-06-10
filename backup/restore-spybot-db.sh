#!/usr/bin/env bash
# Compare spybot DB dumps in this directory and restore one (prefers .dump).
set -euo pipefail

BACKUP_DIR="/opt/spybot/backup"
CONTAINER="${SPYBOT_POSTGRES_CONTAINER:?Set SPYBOT_POSTGRES_CONTAINER to your Postgres container name}"
DB_USER="${SPYBOT_DB_USER:-spybot}"
DB_NAME="${SPYBOT_DB_NAME:-spybot}"
ADMIN_USER="${SPYBOT_POSTGRES_ADMIN_USER:-postgres}"

DUMP_FILE="${BACKUP_DIR}/spybot-db-20260515-064917.dump"
SQLGZ_FILE="${BACKUP_DIR}/spybot-db-20260515.sql.gz"

log() { echo "[restore] $*"; }

compare_dumps() {
  local dump="$1" sqlgz="$2"
  log "=== Comparing dumps ==="
  ls -lh "$dump" "$sqlgz"
  echo ""
  file "$dump" "$sqlgz"
  echo ""

  local dump_tables sql_tables
  dump_tables="$(mktemp)"
  sql_tables="$(mktemp)"
  trap 'rm -f "$dump_tables" "$sql_tables"' RETURN

  docker cp "$dump" "${CONTAINER}:/tmp/compare.dump" >/dev/null
  docker exec "$CONTAINER" pg_restore -l /tmp/compare.dump 2>/dev/null \
    | awk '/TABLE DATA/ {print $NF}' | sort -u >"$dump_tables" || true

  gunzip -c "$sqlgz" | awk '/^COPY public\./ {gsub(/[^a-zA-Z0-9_"]/, "", $2); print $2}' \
    | tr -d '"' | sort -u >"$sql_tables" || true

  local dump_count sql_count
  dump_count="$(wc -l <"$dump_tables" | tr -d ' ')"
  sql_count="$(wc -l <"$sql_tables" | tr -d ' ')"
  log "Tables with data — .dump: ${dump_count}, .sql.gz: ${sql_count}"

  if diff -q "$dump_tables" "$sql_tables" >/dev/null 2>&1; then
    log "Table lists match — same backup; will restore .dump only."
    echo "SAME"
  else
    log "Table lists differ — review before restore:"
    diff "$dump_tables" "$sql_tables" | head -30 || true
    echo "DIFFER"
  fi
}

pre_backup() {
  local out="${BACKUP_DIR}/spybot-pre-restore-$(date +%Y%m%d-%H%M%S).dump"
  log "Backing up current DB to ${out}"
  docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc -f /tmp/pre-restore.dump
  docker cp "${CONTAINER}:/tmp/pre-restore.dump" "$out"
  log "Pre-restore backup saved ($(du -h "$out" | cut -f1))"
}

reset_db() {
  log "Recreating empty database ${DB_NAME}"
  docker exec "$CONTAINER" psql -U "$ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"
  docker exec "$CONTAINER" psql -U "$ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS ${DB_NAME};"
  docker exec "$CONTAINER" psql -U "$ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
}

restore_dump() {
  log "Restoring from ${DUMP_FILE}"
  docker cp "$DUMP_FILE" "${CONTAINER}:/tmp/restore.dump"
  docker exec "$CONTAINER" pg_restore -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl --verbose /tmp/restore.dump
}

restore_sqlgz() {
  log "Restoring from ${SQLGZ_FILE}"
  gunzip -c "$SQLGZ_FILE" | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1
}

verify_db() {
  log "=== Post-restore counts ==="
  docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
    'SELECT '"'"'User'"'"' AS tbl, COUNT(*) FROM "User"
     UNION ALL SELECT '"'"'Page'"'"', COUNT(*) FROM "Page"
     UNION ALL SELECT '"'"'Block'"'"', COUNT(*) FROM "Block"
     UNION ALL SELECT '"'"'MediaAsset'"'"', COUNT(*) FROM "MediaAsset";'
  docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
    'SELECT email, role FROM "User" ORDER BY "createdAt" LIMIT 10;'
}

main() {
  [[ -f "$DUMP_FILE" ]] || { log "Missing ${DUMP_FILE}"; exit 1; }
  [[ -f "$SQLGZ_FILE" ]] || { log "Missing ${SQLGZ_FILE}"; exit 1; }

  compare_dumps "$DUMP_FILE" "$SQLGZ_FILE"

  log "Stopping spybot.service"
  systemctl stop spybot

  pre_backup
  reset_db

  if restore_dump 2>/dev/null; then
    log "pg_restore completed"
  else
    log "pg_restore had errors — retrying with --clean or falling back to sql.gz"
    reset_db
    restore_sqlgz
  fi

  verify_db

  log "Starting spybot.service"
  systemctl start spybot
  sleep 2
  systemctl is-active spybot
  curl -sS -m 10 -o /dev/null -w "spybots.in HTTP %{http_code}\n" https://spybots.in/ || true
  log "Done. Log in at https://spybots.in/admin/login with credentials from the OLD server."
}

main "$@"
