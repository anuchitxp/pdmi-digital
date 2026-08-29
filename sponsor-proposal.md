# PDMI Digital Care Platform — Sponsorship Proposal

**Project:** PDMI Protocol Web Application for Post-ACS Care in Thailand
**Prepared for:** Amgen (Thailand)
**Developer:** Dr. Anuchit Wongphen (นายแพทย์อนุชิต วงศ์เพ็ญ) — Cardiologist / Interventional Cardiologist, Udon Thani Hospital, Thailand
**Date:** 29 August 2026
**Status:** Draft for discussion

---

## 1. Executive Summary

Only **25% of acute coronary syndrome (ACS) patients in Thailand achieve LDL-C below 70 mg/dL** within 4 months of discharge (DYSIS II Thailand). Where rapid, protocol-driven intensification achieves LDL-C <55 mg/dL early after ACS, major adverse cardiovascular events (MACE) fall to **~3%, versus 11–12% under conventional care**.

The PDMI protocol — a national consensus for post-ACS discharge and follow-up in Thailand (Kittiyaphong R, et al., *J Asian Pac Soc Cardiol*. 2025) — defines the clinical pathway. What is missing is a **tool that operationalises it**: today the protocol runs on paper checklists that are inconsistently completed, impossible to audit, and generate no outcome data.

We propose to build a **mobile-ready web application** that digitises the full pathway from admission to one-year follow-up: patient registry, pre-discharge and post-discharge checklists, automated LDL-C / blood pressure / HbA1c goal tracking, and a real-time outcomes dashboard. The platform is a **generic quality-improvement and care-coordination tool**. It is protocol-driven, brand-neutral, and makes no reference to any specific product.

**Support requested from Amgen:** funding for development, pilot deployment, and first-year operation (Section 7).

---

## 2. The Problem

### Clinical gap
- 25% LDL-C goal attainment (<70 mg/dL at 4 months) in Thai post-ACS patients
- Barriers span patients (adherence, understanding, cost), healthcare professionals (time, inconsistent dose titration), and the health system (access restrictions)

### Operational gap
- The national protocol exists, but execution relies on paper checklists
- No systematic capture of whether the 19 pre-discharge items and 10 mandatory follow-up items are completed
- No visibility of cohort-level goal attainment, so dose titration gaps go unseen until complications occur

---

## 3. The Solution

A clinician-facing web application implementing the PDMI protocol end-to-end:

| Capability | Description |
|---|---|
| **Patient registry** | Pseudonymised records (coded IDs only — PDPA-compliant by design) |
| **Pre-discharge checklist** | All 19 protocol items with target-goal summary (LDL-C, BP, HbA1c) |
| **Follow-up visits** | Mandatory and optional post-discharge items, labs/vitals, medication reconciliation |
| **Goal engine** | Automatic assessment of LDL-C <55 mg/dL & ≥50% reduction (or <40 for recurrent events), age-banded BP targets, HbA1c <7% — with follow-up scheduling prompts (LDL recheck 4–6 weeks after dose change) |
| **Outcomes dashboard** | Cohort goal attainment, overdue follow-ups, trends — real-time audit replacing retrospective chart review |
| **Mobile-ready** | Bedside and OPD use on phones/tablets |
| **Data export** | CSV for quality-improvement and outcome reporting |

### Delivery phases

| Phase | Duration | Deliverables |
|---|---|---|
| **1. Build** | Months 1–3 | Application developed, goal engine unit-tested, demo data |
| **2. Pilot** | Months 4–9 | Deployment at 1 pilot hospital; ~100–200 patients enrolled; workflow refinement with cardiologists, fellows, nurses, pharmacists |
| **3. Evaluation** | Months 10–12 | Outcome analysis against KPIs (Section 5); report and publication plan |
| **4. Scale (optional)** | Year 2+ | Multi-hospital expansion (architecture already prepared), Thai-language UI option, EMR integration assessment |

---

## 4. Team & Governance

**Clinical team:** cardiology lead (project owner), fellows, cardiac nurse coordinators (ward & OPD), clinical pharmacist, dietitian/rehabilitation liaison.
**Technical team:** development lead — Dr. Anuchit Wongphen, cardiologist and interventional cardiologist at Udon Thani Hospital, who develops the application and also serves as clinical lead, ensuring the software is built to match real ward and OPD workflows. Hospital IT/EMR team hosts the deployment inside the hospital network.
**Oversight:** quality-improvement unit of the pilot hospital; steering committee (clinical + technical + sponsor representative) meeting quarterly.

### Independence & compliance principles
- **Brand-neutral:** no product names, branding, or promotional content anywhere in the app; drug classes only as specified by the national protocol (e.g., "high-intensity statin ± non-statin therapy")
- **Clinical autonomy:** treatment decisions remain entirely with the treating clinicians following the published national protocol; the app contains no product-specific recommendations
- **Data protection:** pseudonymised by design (coded IDs); hosted inside the hospital network; PDPA-compliant; daily encrypted backups; sponsor receives only aggregated, non-identifiable outcome reports
- **Transparency:** sponsorship acknowledged in publications and in the app's "About" page; results reported regardless of direction

---

## 5. Success Measures (KPIs)

Primary:
1. **LDL-C <55 mg/dL attainment** at 4–6 months post-discharge (target: >50% of enrolled patients vs. 25% baseline for <70 mg/dL)
2. **≥50% LDL-C reduction from baseline** at 4–6 months
3. **Checklist completion rate** (pre-discharge and follow-up, target >90%)

Secondary:
4. Time from discharge to first follow-up visit ≤30 days
5. Rate of lipid-lowering therapy titration within 4–6 weeks of an above-target LDL-C
6. BP and HbA1c goal attainment; medication adherence (nurse-assessed)
7. Recurrent CV events and rehospitalisation within 1 year (exploratory, pilot sample size permitting)

---

## 6. Sustainability

- Open architecture (Next.js/Prisma, standard components) maintainable by hospital IT after handover
- Train-the-trainer model: pilot-site staff train expansion sites
- Modest operating costs (hosting, maintenance) — candidates: hospital QI budget, subsequent sponsor grants, or multi-site consortium funding
- Codebase and documentation owned by the clinical project team; no vendor lock-in

---

## 7. Support Requested from Amgen

| Item | Estimate (THB) | Notes |
|---|---|---|
| Development (Phase 1) | 1,200,000 | Application build, testing, documentation |
| Pilot deployment & on-site support (Phase 2) | 600,000 | Device compatibility, workflow integration, training |
| Evaluation & reporting (Phase 3) | 300,000 | Statistical analysis, report, publication costs |
| Year-1 hosting & maintenance | 150,000 | On-prem hardware contribution / cloud, backups |
| Project management & contingency (~10%) | 250,000 | |
| **Total (12 months)** | **2,500,000** | Indicative; detailed budget on request |

Non-financial support welcomed: project management expertise, and connections to international QI collaboratives.

---

## 8. Risk Register (summary)

| Risk | Mitigation |
|---|---|
| Low staff adoption | Mobile-first design; ≤2-minute checklist completion; nurse-coordinator ownership; workflow co-designed in pilot |
| Data privacy concern | Pseudonymised, in-hospital hosting, PDPA review before go-live |
| Single-site evidence limitation | Pilot framed as feasibility study; multi-site architecture ready for Phase 4 |
| Sponsorship perception | Brand-neutral design, published protocol as sole clinical basis, transparent acknowledgement |

---

## 9. References

1. Buddhari W, et al. LDL-C target attainment in ACS patients in Thailand: DYSIS II. *Heart Lung Circ*. 2020;29(3):405-413.
2. Smith J, et al. Personalised, strike-early-and-strong lipid lowering in AMI. *Eur Heart J Cardiovasc Pharmacother*. 2025;11:43-154.
3. Kittiyaphong R, et al. Post-ACS discharge and long-term follow-up: recommendations for Thailand. *J Asian Pac Soc Cardiol*. 2025;4:e05.
