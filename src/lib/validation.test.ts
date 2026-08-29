import { describe, expect, it } from "vitest";
import { isValid, validate } from "./validation";

describe("validate", () => {
  it("accepts in-range values", () => {
    expect(validate("age", 55)).toBeNull();
    expect(validate("ldlc", 120)).toBeNull();
    expect(validate("hba1c", 6.5)).toBeNull();
    expect(validate("systolic", 120)).toBeNull();
    expect(validate("diastolic", 75)).toBeNull();
    expect(validate("lvef", 45)).toBeNull();
  });

  it("rejects out-of-range values with a message", () => {
    expect(validate("ldlc", 5)).toBe("LDL-C must be between 10 and 500 mg/dL");
    expect(validate("ldlc", 501)).toBe("LDL-C must be between 10 and 500 mg/dL");
    expect(validate("age", 10)).toBe("Age must be between 18 and 120 years");
    expect(validate("hba1c", 25)).toBe("HbA1c must be between 3 and 20 %");
    expect(validate("systolic", 350)).toBe("Systolic BP must be between 50 and 300 mmHg");
    expect(validate("diastolic", 20)).toBe("Diastolic BP must be between 30 and 200 mmHg");
    expect(validate("lvef", 95)).toBe("LVEF must be between 5 and 90 %");
  });

  it("rejects non-finite numbers", () => {
    expect(validate("ldlc", NaN)).toBe("LDL-C must be a number");
  });

  it("isValid matches validate", () => {
    expect(isValid("ldlc", 100)).toBe(true);
    expect(isValid("ldlc", 1)).toBe(false);
  });
});
