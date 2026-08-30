# PDMI Web Application

Clinician-facing web app implementing the Thailand PDMI protocol for post-ACS
discharge and follow-up care. Developed by Dr. Anuchit Wongphen (นพ.อนุชิต
วงศ์เพ็ญ), Udon Thani Hospital — pilot site.

**Users are healthcare professionals only** (cardiologists, fellows, nurses,
pharmacists). No patient-facing features and no login in v1 — designed for
hospital-network deployment.

## Privacy (PDPA)

Data is pseudonymised. The app stores **coded IDs only** (e.g. `H01-P-0142`) —
never patient names, HNs, or other direct identifiers.

## Setup

```bash
npm install
cp .env.example .env   # if needed; DATABASE_URL="file:./prisma/dev.db"
npx prisma migrate dev # create SQLite DB + run migrations + seed demo patients
npm run dev            # http://localhost:3000
```

Demo seed data uses obviously fake coded IDs (`H01-P-TEST-001` …).

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm test` | Vitest — goal engine + validation tests |
| `npx prisma migrate dev` | Apply schema changes (never edit migrations by hand) |
| `npx prisma db seed` | Re-seed demo data |

## Features (v1)

- **Patient registry** — coded-ID patients with ACS details, baseline labs, LVEF
- **Pre-discharge checklist** — 19 items per protocol §6, grouped by section,
  with target-goal summary
- **Follow-up visits** — post-discharge checklist (10 mandatory + 7 optional,
  protocol §7), labs/vitals, medication regimen snapshot, live goal evaluation
- **Goal engine** (`src/lib/goals`) — LDL-C (<55 or <40 mg/dL with ≥2 recurrent
  events, ≥50% reduction), BP by age band, HbA1c <7%, follow-up scheduling
  rules; fully unit-tested
- **Dashboard** — % at LDL-C/BP/HbA1c goal, overdue follow-ups
- **Patient detail** — timeline, goal badges, LDL-C trend chart
- **Print & CSV** — printable care record per patient; registry CSV export for
  QI reporting (`/api/export`)
- **Audit log + soft deletes** — every mutation is audited; nothing is
  hard-deleted
- **Mobile-first UI** — single-column checklist forms, large tap targets,
  sticky save bar; PWA web manifest for "add to home screen"

## Backup & restore

Daily encrypted backup of the SQLite file (see `scripts/backup-db.sh`):

```bash
./scripts/backup-db.sh /path/to/network/share   # uses age or gpg; keeps 30
```

Schedule via cron:
```
0 2 * * * cd /path/to/pdmi-digital && ./scripts/backup-db.sh /mnt/share/pdmi-backups
```

**Restore:** decrypt the backup (`age --decrypt -i key.txt pdmi-YYYYMMDD.db.enc -o restored.db`
or `gpg --decrypt`), stop the app, replace the DB file referenced by
`DATABASE_URL` with the restored file, and restart. Verify by loading the
dashboard.

## Architecture

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS, Prisma + SQLite.
All clinical goal logic lives in `src/lib/goals` (never inlined in components);
all clinical thresholds come from `pdmi-context.md`. Timestamps are stored UTC
and displayed in Asia/Bangkok (yyyy-MM-dd) via the single helper in
`src/lib/format.ts`.

## Deployment

See `DEPLOY.md` for the AlmaLinux 9 (Vultr) deployment runbook — including
firewall rules, pm2 setup, and the PDPA/no-auth precautions for public-IP
testing.

## Security

`npm audit` is clean. Note: `package.json` pins an override on
`deepmerge-ts@^8.0.2` to keep the Prisma 6 CLI free of known advisories;
when upgrading to Prisma 7+, try removing the override.
