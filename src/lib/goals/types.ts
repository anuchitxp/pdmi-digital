export type GoalStatus = "achieved" | "not-achieved" | "unknown";

export interface LdlGoalResult {
  /** Absolute LDL-C target in mg/dL: <55, or <40 if ≥2 recurrent ACS events */
  targetMgDl: number;
  /** % reduction from baseline required (always 50) */
  requiredPercentReduction: number;
  currentLdlc: number | null;
  percentReduction: number | null;
  atAbsoluteTarget: GoalStatus;
  atReductionTarget: GoalStatus;
  /** Both criteria met (unknown if inputs missing) */
  achieved: GoalStatus;
}

export interface BpTarget {
  systolicMax: number;
  /** Upper bound of the acceptable systolic range when the target is a band (e.g. 140–150) */
  systolicBandMax: number | null;
  diastolicMax: number;
  ageBand: string;
}

export interface BpGoalResult {
  target: BpTarget;
  systolic: number | null;
  diastolic: number | null;
  achieved: GoalStatus;
}

export interface Hba1cGoalResult {
  targetPercent: number;
  hba1c: number | null;
  achieved: GoalStatus;
}
