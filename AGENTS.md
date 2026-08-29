# AGENTS.md — PDMI Web Application

## Project Context
Clinician-facing web app implementing the Thailand PDMI protocol for post-ACS discharge
and follow-up care (see `pdmi-context.md` for the protocol and `plan.md` for the plan).
Users are healthcare professionals only — no patient-facing features in v1.
Developed by Dr. Anuchit Wongphen (นพ.อนุชิต วงศ์เพ็ญ), cardiologist / interventional
cardiologist, Udon Thani Hospital, Thailand — pilot site: Udon Thani Hospital.

## Hard Rules
- **Privacy (PDPA):** Data is pseudonymised. Use coded IDs only — NEVER store, generate,
  or log real patient names, HNs, or other direct identifiers. This applies to code,
  seed data, test fixtures, screenshots, and example values.
- **Clinical accuracy:** All targets, checklist items, and schedule rules come from
  `pdmi-context.md`. Do not invent, alter, or "fix" clinical thresholds. If a change to
  clinical logic seems needed, flag it in conversation instead of silently changing it.
- **Goal engine:** All risk-factor goal calculations (LDL-C, BP, HbA1c, LDL % reduction,
  follow-up scheduling) must live in the shared goal-engine module (`src/lib/goals`).
  Never inline these rules in components or pages. Any change to goal logic requires
  updating the corresponding Vitest tests.

## Architecture
- Next.js (App Router) + TypeScript, Prisma + SQLite, Tailwind CSS
- Server Actions / API routes under `src/app`; data access via Prisma only
- Schema changes go through Prisma migrations (`npx prisma migrate dev`), never by
  editing `schema.prisma` history or the DB file directly
- No login system in v1 (hospital-network deployment); design so auth can be added later

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm test` — Vitest (goal engine and utilities)
- `npx prisma migrate dev` — apply schema changes
- `npx prisma db seed` — seed demo data (must be fake patients)

## Conventions
- Seed and test data must use obviously fake coded IDs (e.g., `P-TEST-001`)
- Keep components in `src/components`, shared types in `src/lib/types`
- UI language: English; keep Thai clinical terms out of code identifiers
- Mobile-first: staff use phones/tablets at the bedside and in OPD; all pages must be
  responsive with touch-friendly controls (large tap targets, no desktop-only layouts)
