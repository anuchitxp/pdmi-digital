// PDMI goal engine — all risk-factor target rules live here (see AGENTS.md).
// Thresholds come verbatim from pdmi-context.md §6/§7 target-goal tables.
import { isValid } from "../validation";
import type {
  BpGoalResult,
  BpTarget,
  GoalStatus,
  Hba1cGoalResult,
  LdlGoalResult,
} from "./types";

// ---------------------------------------------------------------------------
// LDL-C
// ---------------------------------------------------------------------------

/** Absolute LDL-C target: <55 mg/dL, or <40 mg/dL for ≥2 recurrent ACS events. */
export function ldlTargetMgDl(recurrentEvents: number): number {
  return recurrentEvents >= 2 ? 40 : 55;
}

export function evaluateLdlGoal(input: {
  ldlc: number | null;
  baselineLdlc: number | null;
  recurrentEvents: number;
}): LdlGoalResult {
  const targetMgDl = ldlTargetMgDl(input.recurrentEvents);
  const requiredPercentReduction = 50;

  const ldlcValid = input.ldlc !== null && isValid("ldlc", input.ldlc);
  const baselineValid =
    input.baselineLdlc !== null && isValid("ldlc", input.baselineLdlc);

  const currentLdlc = ldlcValid ? (input.ldlc as number) : null;
  const baselineLdlc = baselineValid ? (input.baselineLdlc as number) : null;

  const percentReduction =
    currentLdlc !== null && baselineLdlc !== null && baselineLdlc > 0
      ? ((baselineLdlc - currentLdlc) / baselineLdlc) * 100
      : null;

  const atAbsoluteTarget: GoalStatus =
    currentLdlc === null ? "unknown" : currentLdlc < targetMgDl ? "achieved" : "not-achieved";

  const atReductionTarget: GoalStatus =
    percentReduction === null
      ? "unknown"
      : percentReduction >= requiredPercentReduction
        ? "achieved"
        : "not-achieved";

  const achieved: GoalStatus =
    atAbsoluteTarget === "achieved" && atReductionTarget === "achieved"
      ? "achieved"
      : atAbsoluteTarget === "unknown" || atReductionTarget === "unknown"
        ? "unknown"
        : "not-achieved";

  return {
    targetMgDl,
    requiredPercentReduction,
    currentLdlc,
    percentReduction:
      percentReduction === null ? null : Math.round(percentReduction * 10) / 10,
    atAbsoluteTarget,
    atReductionTarget,
    achieved,
  };
}

// ---------------------------------------------------------------------------
// Blood pressure — targets by age band (pdmi-context.md §6/§7)
//   18–65 years:                <130/<80 mmHg
//   >65–79 years:               <140/<90 mmHg
//   >65 years (if tolerated):   <130/<80 mmHg
//   >80 years:                  <140–150/<80 mmHg
// ---------------------------------------------------------------------------

export function bpTarget(age: number): BpTarget {
  if (age >= 18 && age <= 65) {
    return { systolicMax: 130, systolicBandMax: null, diastolicMax: 80, ageBand: "18–65" };
  }
  if (age > 65 && age <= 79) {
    return { systolicMax: 140, systolicBandMax: null, diastolicMax: 90, ageBand: ">65–79" };
  }
  // >80 years
  return {
    systolicMax: 140,
    systolicBandMax: 150,
    diastolicMax: 80,
    ageBand: ">80",
  };
}

export function evaluateBpGoal(input: {
  age: number;
  systolic: number | null;
  diastolic: number | null;
}): BpGoalResult {
  const target = bpTarget(input.age);
  const sysValid = input.systolic !== null && isValid("systolic", input.systolic);
  const diaValid = input.diastolic !== null && isValid("diastolic", input.diastolic);

  const systolic = sysValid ? (input.systolic as number) : null;
  const diastolic = diaValid ? (input.diastolic as number) : null;

  if (systolic === null || diastolic === null) {
    return { target, systolic, diastolic, achieved: "unknown" };
  }

  const sysOk =
    target.systolicBandMax === null
      ? systolic < target.systolicMax
      : systolic >= target.systolicMax && systolic <= target.systolicBandMax ||
        systolic < target.systolicMax;
  const diaOk = diastolic < target.diastolicMax;

  return {
    target,
    systolic,
    diastolic,
    achieved: sysOk && diaOk ? "achieved" : "not-achieved",
  };
}

// ---------------------------------------------------------------------------
// HbA1c — <7% for diabetic patients (individualised per protocol)
// ---------------------------------------------------------------------------

export const HBA1C_TARGET_PERCENT = 7;

export function evaluateHba1cGoal(input: {
  hasDiabetes: boolean;
  hba1c: number | null;
}): Hba1cGoalResult {
  if (!input.hasDiabetes) {
    return { targetPercent: HBA1C_TARGET_PERCENT, hba1c: null, achieved: "unknown" };
  }
  const valid = input.hba1c !== null && isValid("hba1c", input.hba1c);
  if (!valid) {
    return {
      targetPercent: HBA1C_TARGET_PERCENT,
      hba1c: null,
      achieved: "unknown",
    };
  }
  const hba1c = input.hba1c as number;
  return {
    targetPercent: HBA1C_TARGET_PERCENT,
    hba1c,
    achieved: hba1c < HBA1C_TARGET_PERCENT ? "achieved" : "not-achieved",
  };
}

// ---------------------------------------------------------------------------
// Follow-up scheduling (pdmi-context.md §3 footnote, §5)
// ---------------------------------------------------------------------------

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Re-evaluate LDL 4–6 weeks after each treatment/dose adjustment. */
export function ldlRecheckWindow(doseChangeDate: Date): { earliest: Date; latest: Date } {
  return {
    earliest: new Date(doseChangeDate.getTime() + 28 * DAY_MS), // 4 weeks
    latest: new Date(doseChangeDate.getTime() + 42 * DAY_MS), // 6 weeks
  };
}

/** First follow-up visit must occur within 30 days of discharge. */
export function firstVisitDeadline(dischargeDate: Date): Date {
  return new Date(dischargeDate.getTime() + 30 * DAY_MS);
}

/** Routine follow-up interval: every 3–6 months up to 1 year. */
export function nextVisitWindow(lastVisitDate: Date): { earliest: Date; latest: Date } {
  return {
    earliest: new Date(lastVisitDate.getTime() + 90 * DAY_MS), // 3 months
    latest: new Date(lastVisitDate.getTime() + 180 * DAY_MS), // 6 months
  };
}

/** HbA1c at least twice a year for diabetic patients → minimum 6-month spacing. */
export function hba1cDueDates(lastHba1cDate: Date): { first: Date; second: Date } {
  return {
    first: new Date(lastHba1cDate.getTime() + 90 * DAY_MS),
    second: new Date(lastHba1cDate.getTime() + 180 * DAY_MS),
  };
}

/** Is a patient's next visit overdue relative to the 6-month upper bound? */
export function isFollowUpOverdue(
  today: Date,
  lastVisitDate: Date | null,
  nextVisitDate: Date | null,
): boolean {
  if (nextVisitDate) {
    return today.getTime() > nextVisitDate.getTime() + 7 * DAY_MS; // 1-week grace
  }
  if (lastVisitDate) {
    return today.getTime() > nextVisitWindow(lastVisitDate).latest.getTime();
  }
  return false;
}
