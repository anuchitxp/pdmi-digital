# Done — Completed Work Tracker

Track finished work here. Move items from `plan.md` as they are completed.

## Completed

- [x] Project documentation (`AGENTS.md`, `pdmi-context.md`, `plan.md`, `sponsor-proposal.md`)
- [x] Sponsor page (`docs/index.html`)
- [x] Scaffold Next.js 14 (App Router) + TypeScript + Tailwind + Vitest
- [x] Prisma schema (Hospital, Patient, checklists, Visit, LabResult, Vitals, MedicationRegimen, AuditLog; soft deletes) + initial migration + demo seed (`H01-P-TEST-00x`)
- [x] Goal engine (`src/lib/goals`) — LDL-C/BP/HbA1c targets, follow-up scheduling — with 38 Vitest tests
- [x] Shared validation module (`src/lib/validation.ts`) + tests
- [x] Server actions + audit logging (patients, pre-discharge checklist, visits)
- [x] UI: dashboard (goal %, overdue follow-ups), patient list w/ search + CSV export link, new-patient form, pre-discharge checklist form, visit form, patient detail (timeline, goal badges, LDL-C trend chart)
- [x] Print view (patient care record) + CSV export (`/api/export`) + PWA web manifest
- [x] Backup script (`scripts/backup-db.sh`) + README with setup/restore instructions
- [x] Verified: `npm test` (38 passing), `npm run build`, smoke test of all routes
- [x] Date display format changed to yyyy-MM-dd (single helper `src/lib/format.ts`)
- [x] Security upgrade: Next.js 14.2.21 → 16.3.3, React 19, recharts 3, vitest 4 — clears all runtime advisories (async `params`/`searchParams`, `useActionState`)
- [x] `deepmerge-ts@^8` override for Prisma 6 CLI — `npm audit` now reports 0 vulnerabilities
- [x] `DEPLOY.md` — AlmaLinux 9 / Vultr deployment runbook (Node 22, pm2, firewalld + Vultr firewall, backup cron)

## Known limitations / next steps

- [ ] No login/auth in v1 (per plan); audit actor is a free-text field
- [ ] Pre-discharge checklist completion does not gate discharge state machine
- [ ] Dashboard trend charts are per-patient only; cohort trends not yet built
- [ ] Prisma 7 CLI migration (would let the deepmerge-ts override be dropped)
- [ ] Local dev DB now holds real (pseudonymised) patients — keep Vultr test instance on fake seed data only
