import { describe, expect, it } from "vitest";
import { monthlyAtGoalTrend, monthKey } from "./trends";
import type { GoalStatus } from "./goals/types";

const end = new Date(2026, 7, 15); // 2026-08-15

describe("monthKey", () => {
  it("zero-pads the month", () => {
    expect(monthKey(new Date(2026, 0, 3))).toBe("2026-01");
    expect(monthKey(new Date(2026, 11, 3))).toBe("2026-12");
  });
});

describe("monthlyAtGoalTrend", () => {
  it("computes at-goal percentage per month, sorted ascending", () => {
    const rows: { month: string; status: GoalStatus }[] = [
      { month: "2026-07", status: "achieved" },
      { month: "2026-07", status: "not-achieved" },
      { month: "2026-08", status: "achieved" },
      { month: "2026-06", status: "not-achieved" },
    ];
    expect(monthlyAtGoalTrend(rows, end)).toEqual([
      { month: "2026-06", pct: 0 },
      { month: "2026-07", pct: 50 },
      { month: "2026-08", pct: 100 },
    ]);
  });

  it("ignores unknown statuses and months with no measured entries", () => {
    const rows: { month: string; status: GoalStatus }[] = [
      { month: "2026-08", status: "unknown" },
      { month: "2026-02", status: "achieved" }, // outside 6-month window (Mar–Aug 2026)
      { month: "2026-03", status: "achieved" },
    ];
    expect(monthlyAtGoalTrend(rows, end)).toEqual([{ month: "2026-03", pct: 100 }]);
  });

  it("limits to the requested window", () => {
    const rows = [1, 2, 3, 4, 5, 6, 7, 8].map((m) => ({
      month: `2026-${String(m).padStart(2, "0")}`,
      status: "achieved" as GoalStatus,
    }));
    const trend = monthlyAtGoalTrend(rows, end, 3);
    expect(trend.map((t) => t.month)).toEqual(["2026-06", "2026-07", "2026-08"]);
  });

  it("returns empty for no measured data", () => {
    expect(monthlyAtGoalTrend([], end)).toEqual([]);
  });
});
