#!/usr/bin/env bash
# One-command update for the Vultr/AlmaLinux 9 server (see DEPLOY.md).
# Usage: ./scripts/update.sh
# Backs up the DB first, then pull → ci → test → migrate deploy → build → pm2 restart.
# Stops at the first failing step; the app keeps running the previous build
# until every step has passed.

set -euo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "Not inside the pdmi-digital git repo" >&2
  exit 1
}

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 not found — install with: sudo npm i -g pm2" >&2
  exit 1
fi
pm2 describe pdmi >/dev/null 2>&1 || {
  echo "pm2 process 'pdmi' not found — start it first (see DEPLOY.md §3)" >&2
  exit 1
}

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty — local changes on the server would be overwritten." >&2
  echo "Commit/stash them, or 'git checkout -- .' if they are accidental, then retry." >&2
  exit 1
fi

OLD_SHA="$(git rev-parse --short HEAD)"
echo "==> Current commit: $OLD_SHA"

echo "==> Backing up database"
./scripts/backup-db.sh "${PDMI_BACKUP_DIR:-./backups}"

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing dependencies"
npm ci

echo "==> Running tests (goal engine is clinical logic — never skip)"
npm test

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Building"
# 1 GB instance: cap the heap so the Next.js build is not OOM-killed.
NODE_OPTIONS="--max-old-space-size=768" npm run build

echo "==> Restarting app"
pm2 restart pdmi

NEW_SHA="$(git rev-parse --short HEAD)"
echo "==> Updated $OLD_SHA → $NEW_SHA. Verify at http://<instance-ip>:3000"
