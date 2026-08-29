# PDMI Web Application — Implementation Plan

A clinician-facing web app implementing the Thailand PDMI protocol for post-ACS care: patient registry, digital pre-discharge and post-discharge checklists, risk-factor goal tracking (LDL-C, BP, HbA1c), and an outcomes dashboard.

## Users & Stakeholders
(from protocol §8; the app serves clinical users directly)

| Role | Use of the app |
|------|----------------|
| **Cardiologist / Interventional Cardiologist** (incl. fellow, staff) | Project lead & clinical oversight; reviews and signs off checklist items, medication adjustments, dose titration |
| **Fellow** | Protocol execution — completes pre-discharge and follow-up checklists, patient/family education records, data entry |
| **Cardiac nurse coordinator / Ward nurse** | Inpatient pre-discharge checklist completion, patient and family counselling records |
| **OPD nurse** | STEMI-clinic follow-up visits, adherence monitoring, vitals/labs entry |
| **Clinical pharmacist** | Reviews discharge medication list, drug-interaction checks, adherence counselling; medication reconciliation records |
| **Dietitian / rehabilitation team** | Cardiac rehab referrals and lifestyle-modification documentation |
| **Medical records / QI unit** (indirect) | Consumes CSV exports and the outcomes dashboard for audit/QI reporting |
| **Hospital IT / EMR team** (indirect) | Hosts and maintains the deployment inside the hospital network |

Non-users of the app in v1: patients/caregivers and primary care physicians (they receive the discharge summary and follow-up plan through existing channels).

## Clinical Workflow (admission → OPD follow-up, mapped to app features)

1. **ACS admission (inpatient)** — baseline captured: ACS type (STEMI/NSTEMI/UA), PCI y/n, recurrent-event count, baseline LDL-C, HbA1c, echo/LVEF, diabetes status → *Patient record created with coded ID*
2. **Pre-discharge (by ward team)** — 19-item pre-discharge checklist (§6): confirm investigations, prescribing of GDMT (antiplatelets, high-intensity statin ± ezetimibe/PCSK9i, antihypertensives, antidiabetics incl. SGLT2i/GLP-1 RA), patient/caregiver education, vaccination advice, cardiac rehab referral, follow-up appointment and responsible physician → *Pre-discharge checklist form; target-goal summary shown*
3. **Discharge** — written plan given, summary sent to primary care provider → *Patient moves to "post-discharge" registry state; next-visit date recorded*
4. **Early telephone contact** — call 2–3 days post-discharge (then every ~3 weeks) to address concerns and check adherence → *Optional contact log entry on patient timeline*
5. **First OPD visit ≤30 days** — mandatory checklist (§7 Part 1): symptoms since last visit, lipid profile, HbA1c, medication compliance, adjustments considered, education, next appointment; optional items (ECG/CXR, echo, rehab participation) as indicated → *Visit form with labs/vitals and med reconciliation; goal engine shows LDL-C/BP/HbA1c attainment*
6. **Repeat follow-up every 3–6 months up to 1 year** — same checklist per visit; LDL-C rechecked 4–6 weeks after any dose adjustment; dose titration at every visit where targets unmet → *Visits accumulate on timeline; dashboard tracks goal attainment and overdue follow-ups*
7. **1-year outcome review** — LDL-C goal (<55 or <40 mg/dL), BP goal, HbA1c goal, MACE/recurrent events → *Dashboard/CSV export for QI reporting*

## Decisions
- **Users:** Healthcare professionals only (cardiologists, fellows, nurses, pharmacists); no patient portal in v1
- **Scope (v1):** Full workflow — registry, pre-discharge checklist, follow-up visits with mandatory/optional items, goal tracking, outcomes dashboard
- **Stack:** Next.js 14+ (App Router) + TypeScript, Prisma + SQLite, Tailwind CSS
- **Privacy:** Pseudonymised — coded IDs only, no real names/HN stored; intended to run inside the hospital network; no login system in v1
- **Mobile-ready:** All pages must be responsive (mobile-first) — ward/OPD staff will use phones/tablets at the bedside and in clinic; checklist forms must be thumb-friendly (large tap targets, single-column layout on small screens, sticky save bar); dashboard charts must reflow on narrow viewports

## Data Model (Prisma)
- **Patient**: codedId (unique per hospital, namespaced e.g. `H01-P-0142`), age, sex, dischargeDate, ACS event details (STEMI/NSTEMI/UA, PCI y/n, recurrentEvents count), baseline LDL-C, diabetes status, LVEF; required `hospitalId` → **Hospital** table (single row in v1, see "Future expansion: multi-hospital")
- **PreDischargeChecklist**: 19 items per protocol §6, each with status (yes/no/na) + notes, linked to Patient
- **Visit**: date, visitType (first-30-day / 3-6mo / 1yr), linked to Patient
- **PostDischargeChecklist**: mandatory (10) + optional (7) items per protocol §7, linked to Visit
- **LabResult / Vitals**: LDL-C, HbA1c, systolic/diastolic BP, recorded per Visit; auto-computed LDL % reduction from baseline
- **MedicationRegimen**: per-visit snapshot (antiplatelet, statin intensity + non-statin, antihypertensive classes, SGLT2i/GLP-1 RA) to support titration tracking
- **AuditLog**: lightweight provenance — record (entity type, entity id, action, timestamp, actor label) for every create/update of patients, checklists, and visits
- All clinical entities (Patient, Visit, checklists) use **soft delete** (`deletedAt` timestamp), never hard delete, to preserve QI data integrity

## Non-functional Requirements
- **Timezone & locale:** All timestamps stored in UTC, displayed in Asia/Bangkok (UTC+7, no DST); dates shown in Gregorian `dd/MM/yyyy`. No timezone arithmetic anywhere except in one shared formatting helper.
- **Validation & units:** Forms and goal engine share one validation module — LDL-C (mg/dL, 10–500), HbA1c (%, 3–20), systolic BP (50–300), diastolic BP (30–200), LVEF (%, 5–90), age (18–120). Out-of-range input is rejected at form level with a clear message, never silently clamped.
- **Backup & restore (deliverable, not afterthought):** daily encrypted copy of the SQLite file to a second location (network share or USB), plus documented restore instructions in the README. The backup routine ships with v1.
- **PWA-lite:** web manifest + "add to home screen" for ward phones. True offline support is explicitly out of scope for v1.

## Future expansion: multi-hospital
Multi-hospital operation is a goal after the single-site pilot. Deferred as a *feature* (site management UI, cross-site access control, cross-site analytics), but v1 is designed so it doesn't need a rewrite:

- **Schema:** every Patient row carries a required `hospitalId` referencing a `Hospital` table. V1 seeds exactly one hospital row; all queries already filter by it, so adding sites later is data, not migration surgery.
- **Coded IDs:** the coded-ID scheme is namespaced per hospital (e.g., `H01-P-0142`) so IDs never collide across sites; uniqueness is enforced on (hospitalId, codedId), not codedId alone.
- **Isolation options kept open:** single shared database with row-level `hospitalId` filtering (chosen design) still permits later splitting to per-hospital databases, since no query assumes a single tenant.
- **Audit log & actor model:** AuditLog already carries an actor label; a future `User` table with hospital membership slots in without reshaping the log.
- **Deployment implication:** when multi-hospital arrives, the app likely moves from on-prem per hospital to the cloud Bangkok region (Google `asia-southeast3` / AWS `ap-southeast-7`) with PostgreSQL — already a one-line Prisma change — plus per-site PDPA data-processing agreements.

## Deferred to future versions (explicitly out of v1 scope)
Authentication/login, notifications/reminders, patient self-reporting, and hospital EMR/FHIR integration (CSV export is the interim bridge). Multi-hospital *features* (site management UI, cross-site analytics) are also deferred — see "Future expansion" above for what v1 already does to prepare.

## Goal Engine (shared logic module)
Per protocol targets, computed automatically from patient age + latest labs:
- LDL-C <55 mg/dL AND ≥50% reduction (or <40 if ≥2 recurrent ACS events)
- BP targets by age band (<130/80, <140/90, <140-150/80)
- HbA1c <7% (diabetics only)
- Follow-up scheduling: LDL recheck 4–6 wks after dose change; HbA1c 2×/yr; next-visit suggestions every 3–6 months

## Pages / Features
1. **Dashboard** — % patients at LDL-C goal, BP goal, HbA1c goal; overdue follow-ups list; trend charts (recharts)
2. **Patient list** — search/filter by goal status, add patient (coded ID)
3. **Patient detail** — timeline of visits, goal status badges, med history, lab trends
4. **Pre-discharge checklist form** — grouped per §6 sections, target-goal summary panel, notes
5. **Visit form** — post-discharge checklist (mandatory/optional), lab/vitals entry, med reconciliation; live goal-achievement feedback
6. **Mobile-ready UI** — mobile-first responsive Tailwind layouts throughout; single-column checklist forms with segmented Yes/No/N/A controls sized for touch, sticky action bar on mobile, collapsible patient-detail sections, and horizontally scrollable data tables (or card view on phones); dashboard cards stack on narrow viewports
7. **Print/export** — checklist print stylesheet; CSV export of registry for QI reporting

## Implementation Steps
1. Scaffold Next.js + Tailwind + Prisma/SQLite; define schema, migrate
2. Goal-engine library with unit tests (Vitest) covering all target rules
3. API routes (patients, checklists, visits, labs) + server actions
4. UI: dashboard → patient list → detail → both checklist forms
5. Print styles + CSV export
6. Seed script with demo data; README with setup instructions

## Verification
- Unit tests for goal calculations
- Run dev server, walk through full workflow: create patient → pre-discharge checklist → visit with labs → verify dashboard reflects goals
