// Shared input validation used by both forms and the goal engine.
// Out-of-range input is rejected with a clear message, never clamped.

export type Field =
  | "age"
  | "ldlc"
  | "hba1c"
  | "systolic"
  | "diastolic"
  | "lvef"
  | "heartRate";

interface Range {
  min: number;
  max: number;
  unit: string;
  label: string;
}

export const VALIDATION_RANGES: Record<Field, Range> = {
  age: { min: 18, max: 120, unit: "years", label: "Age" },
  ldlc: { min: 10, max: 500, unit: "mg/dL", label: "LDL-C" },
  hba1c: { min: 3, max: 20, unit: "%", label: "HbA1c" },
  systolic: { min: 50, max: 300, unit: "mmHg", label: "Systolic BP" },
  diastolic: { min: 30, max: 200, unit: "mmHg", label: "Diastolic BP" },
  lvef: { min: 5, max: 90, unit: "%", label: "LVEF" },
  heartRate: { min: 20, max: 250, unit: "bpm", label: "Heart rate" },
};

export function validate(field: Field, value: number): string | null {
  const r = VALIDATION_RANGES[field];
  if (!Number.isFinite(value)) {
    return `${r.label} must be a number`;
  }
  if (value < r.min || value > r.max) {
    return `${r.label} must be between ${r.min} and ${r.max} ${r.unit}`;
  }
  return null;
}

export function isValid(field: Field, value: number): boolean {
  return validate(field, value) === null;
}
