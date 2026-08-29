import { describe, expect, it } from "vitest";
import {
  bpTarget,
  evaluateBpGoal,
  evaluateHba1cGoal,
  evaluateLdlGoal,
  firstVisitDeadline,
  hba1cDueDates,
  isFollowUpOverdue,
  ldlRecheckWindow,
  ldlTargetMgDl,
  nextVisitWindow,
} from "./index";

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// LDL-C
// ---------------------------------------------------------------------------

describe("ldlTargetMgDl", () => {
  it("uses <55 mg/dL for first event", () => {
    expect(ldlTargetMgDl(1)).toBe(55);
  });
  it("uses <40 mg/dL for ≥2 recurrent ACS events", () => {
    expect(ldlTargetMgDl(2)).toBe(40);
    expect(ldlTargetMgDl(3)).toBe(40);
  });
});

describe("evaluateLdlGoal", () => {
  it("achieved when both <55 and ≥50% reduction met", () => {
    const r = evaluateLdlGoal({ ldlc: 50, baselineLdlc: 120, recurrentEvents: 1 });
    expect(r.atAbsoluteTarget).toBe("achieved");
    expect(r.atReductionTarget).toBe("achieved");
    expect(r.achieved).toBe("achieved");
    expect(r.percentReduction).toBeCloseTo(58.3, 1);
  });

  it("not achieved when absolute target met but reduction <50%", () => {
    const r = evaluateLdlGoal({ ldlc: 50, baselineLdlc: 90, recurrentEvents: 1 });
    expect(r.atAbsoluteTarget).toBe("achieved");
    expect(r.atReductionTarget).toBe("not-achieved");
    expect(r.achieved).toBe("not-achieved");
  });

  it("not achieved when reduction met but LDL ≥55", () => {
    const r = evaluateLdlGoal({ ldlc: 56, baselineLdlc: 130, recurrentEvents: 1 });
    expect(r.atAbsoluteTarget).toBe("not-achieved");
    expect(r.atReductionTarget).toBe("achieved");
    expect(r.achieved).toBe("not-achieved");
  });

  it("boundary: LDL exactly 55 is not below target", () => {
    const r = evaluateLdlGoal({ ldlc: 55, baselineLdlc: 200, recurrentEvents: 1 });
    expect(r.atAbsoluteTarget).toBe("not-achieved");
  });

  it("uses 40 target with recurrent events", () => {
    const r = evaluateLdlGoal({ ldlc: 45, baselineLdlc: 100, recurrentEvents: 2 });
    expect(r.targetMgDl).toBe(40);
    expect(r.atAbsoluteTarget).toBe("not-achieved");
  });

  it("exactly 50% reduction counts as achieved", () => {
    const r = evaluateLdlGoal({ ldlc: 50, baselineLdlc: 100, recurrentEvents: 1 });
    expect(r.atReductionTarget).toBe("achieved");
  });

  it("unknown when labs missing", () => {
    const r = evaluateLdlGoal({ ldlc: null, baselineLdlc: 120, recurrentEvents: 1 });
    expect(r.achieved).toBe("unknown");
    expect(r.percentReduction).toBeNull();
  });

  it("unknown when baseline missing", () => {
    const r = evaluateLdlGoal({ ldlc: 50, baselineLdlc: null, recurrentEvents: 1 });
    expect(r.atAbsoluteTarget).toBe("achieved");
    expect(r.atReductionTarget).toBe("unknown");
    expect(r.achieved).toBe("unknown");
  });

  it("treats out-of-range LDL as unknown", () => {
    const r = evaluateLdlGoal({ ldlc: 999, baselineLdlc: 120, recurrentEvents: 1 });
    expect(r.achieved).toBe("unknown");
    expect(r.currentLdlc).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Blood pressure
// ---------------------------------------------------------------------------

describe("bpTarget", () => {
  it("18–65: <130/<80", () => {
    expect(bpTarget(40)).toMatchObject({
      systolicMax: 130,
      diastolicMax: 80,
      ageBand: "18–65",
    });
  });
  it("boundary ages 18 and 65 in young band", () => {
    expect(bpTarget(18).ageBand).toBe("18–65");
    expect(bpTarget(65).ageBand).toBe("18–65");
  });
  it(">65–79: <140/<90", () => {
    expect(bpTarget(70)).toMatchObject({
      systolicMax: 140,
      diastolicMax: 90,
      ageBand: ">65–79",
    });
    expect(bpTarget(66).ageBand).toBe(">65–79");
    expect(bpTarget(79).ageBand).toBe(">65–79");
  });
  it(">80: <140–150/<80", () => {
    const t = bpTarget(85);
    expect(t.systolicMax).toBe(140);
    expect(t.systolicBandMax).toBe(150);
    expect(t.diastolicMax).toBe(80);
    expect(t.ageBand).toBe(">80");
  });
});

describe("evaluateBpGoal", () => {
  it("achieved below target", () => {
    const r = evaluateBpGoal({ age: 50, systolic: 120, diastolic: 75 });
    expect(r.achieved).toBe("achieved");
  });
  it("not achieved at/above systolic target", () => {
    const r = evaluateBpGoal({ age: 50, systolic: 130, diastolic: 75 });
    expect(r.achieved).toBe("not-achieved");
  });
  it("not achieved at/above diastolic target", () => {
    const r = evaluateBpGoal({ age: 50, systolic: 120, diastolic: 80 });
    expect(r.achieved).toBe("not-achieved");
  });
  it("70-year-old band <140/<90", () => {
    expect(evaluateBpGoal({ age: 70, systolic: 138, diastolic: 88 }).achieved).toBe("achieved");
    expect(evaluateBpGoal({ age: 70, systolic: 141, diastolic: 88 }).achieved).toBe("not-achieved");
  });
  it("85-year-old band 140–150 systolic accepted", () => {
    expect(evaluateBpGoal({ age: 85, systolic: 145, diastolic: 78 }).achieved).toBe("achieved");
    expect(evaluateBpGoal({ age: 85, systolic: 151, diastolic: 78 }).achieved).toBe("not-achieved");
    expect(evaluateBpGoal({ age: 85, systolic: 135, diastolic: 78 }).achieved).toBe("achieved");
  });
  it("unknown when vitals missing", () => {
    expect(evaluateBpGoal({ age: 50, systolic: null, diastolic: 75 }).achieved).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// HbA1c
// ---------------------------------------------------------------------------

describe("evaluateHba1cGoal", () => {
  it("achieved when <7% for diabetic", () => {
    expect(evaluateHba1cGoal({ hasDiabetes: true, hba1c: 6.5 }).achieved).toBe("achieved");
  });
  it("not achieved when ≥7%", () => {
    expect(evaluateHba1cGoal({ hasDiabetes: true, hba1c: 7 }).achieved).toBe("not-achieved");
    expect(evaluateHba1cGoal({ hasDiabetes: true, hba1c: 8.2 }).achieved).toBe("not-achieved");
  });
  it("unknown for non-diabetic patients", () => {
    expect(evaluateHba1cGoal({ hasDiabetes: false, hba1c: 6.5 }).achieved).toBe("unknown");
  });
  it("unknown when missing or out of range", () => {
    expect(evaluateHba1cGoal({ hasDiabetes: true, hba1c: null }).achieved).toBe("unknown");
    expect(evaluateHba1cGoal({ hasDiabetes: true, hba1c: 99 }).achieved).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// Follow-up scheduling
// ---------------------------------------------------------------------------

describe("ldlRecheckWindow", () => {
  it("returns 4–6 week window after dose change", () => {
    const d = new Date("2026-01-01T00:00:00Z");
    const w = ldlRecheckWindow(d);
    expect((w.earliest.getTime() - d.getTime()) / DAY_MS).toBe(28);
    expect((w.latest.getTime() - d.getTime()) / DAY_MS).toBe(42);
  });
});

describe("firstVisitDeadline", () => {
  it("is 30 days after discharge", () => {
    const d = new Date("2026-01-01T00:00:00Z");
    expect((firstVisitDeadline(d).getTime() - d.getTime()) / DAY_MS).toBe(30);
  });
});

describe("nextVisitWindow", () => {
  it("is 3–6 months after last visit", () => {
    const d = new Date("2026-01-01T00:00:00Z");
    const w = nextVisitWindow(d);
    expect((w.earliest.getTime() - d.getTime()) / DAY_MS).toBe(90);
    expect((w.latest.getTime() - d.getTime()) / DAY_MS).toBe(180);
  });
});

describe("hba1cDueDates", () => {
  it("gives two due dates within the year (2×/yr minimum)", () => {
    const d = new Date("2026-01-01T00:00:00Z");
    const { first, second } = hba1cDueDates(d);
    expect((first.getTime() - d.getTime()) / DAY_MS).toBe(90);
    expect((second.getTime() - d.getTime()) / DAY_MS).toBe(180);
  });
});

describe("isFollowUpOverdue", () => {
  const today = new Date("2026-06-01T00:00:00Z");
  it("overdue when past scheduled date beyond grace", () => {
    expect(isFollowUpOverdue(today, null, new Date("2026-05-01T00:00:00Z"))).toBe(true);
  });
  it("within grace period is not overdue", () => {
    expect(isFollowUpOverdue(today, null, new Date("2026-05-28T00:00:00Z"))).toBe(false);
  });
  it("overdue when past 6-month upper bound with no scheduled date", () => {
    expect(isFollowUpOverdue(today, new Date("2025-11-01T00:00:00Z"), null)).toBe(true);
  });
  it("not overdue within 6 months", () => {
    expect(isFollowUpOverdue(today, new Date("2026-03-01T00:00:00Z"), null)).toBe(false);
  });
  it("no visits yet is not overdue", () => {
    expect(isFollowUpOverdue(today, null, null)).toBe(false);
  });
});
