#!/usr/bin/env bash
# Daily encrypted backup of the SQLite database (plan.md: backup ships with v1).
# Usage: ./scripts/backup-db.sh /path/to/backup/dir  (default: ./backups)
# Schedule with cron, e.g. daily at 02:00:
#   0 2 * * * cd /path/to/pdmi-digital && ./scripts/backup-db.sh /mnt/share/pdmi-backups

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
DB_FILE="${DATABASE_URL:-file:./prisma/dev.db}"
DB_PATH="${DB_FILE#file:}"

if [ ! -f "$DB_PATH" ]; then
  echo "Database not found at $DB_PATH" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/pdmi-$STAMP.db.enc"

# Use SQLite's online backup for a consistent snapshot, then encrypt with age/gpg.
# Requires either `age` or `gpg` on the host.
TMP_DB="$(mktemp)"
sqlite3 "$DB_PATH" ".backup '$TMP_DB'"

if command -v age >/dev/null 2>&1; then
  age -r "${BACKUP_AGE_RECIPIENT:-age1defaultnotset}" -o "$OUT" "$TMP_DB"
elif command -v gpg >/dev/null 2>&1; then
  gpg --batch --yes --symmetric --cipher-algo AES256 -o "$OUT" "$TMP_DB"
else
  echo "Neither age nor gpg found — copying unencrypted (not recommended)" >&2
  cp "$TMP_DB" "$BACKUP_DIR/pdmi-$STAMP.db"
fi

rm -f "$TMP_DB"

# Keep the most recent 30 backups
ls -1t "$BACKUP_DIR"/pdmi-* 2>/dev/null | tail -n +31 | xargs -r rm --

echo "Backup written to $OUT"
