import type { GoalStatus } from "./goals/types";

export interface TrendPoint {
  /** Month key, e.g. "2026-08" */
  month: string;
  /** % of measured entries at goal that month */
  pct: number;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Group goal statuses by calendar month and compute the at-goal percentage
 * per month, keeping only the last `months` months (inclusive of endDate's
 * month) that have at least one measured (non-unknown) entry.
 */
export function monthlyAtGoalTrend(
  rows: { month: string; status: GoalStatus }[],
  endDate: Date,
  months = 6,
): TrendPoint[] {
  const byMonth = new Map<string, { atGoal: number; measured: number }>();
  for (const row of rows) {
    if (row.status === "unknown") continue;
    const bucket = byMonth.get(row.month) ?? { atGoal: 0, measured: 0 };
    bucket.measured++;
    if (row.status === "achieved") bucket.atGoal++;
    byMonth.set(row.month, bucket);
  }

  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const cutoffs = new Set<string>();
  for (let i = 0; i < months; i++) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    cutoffs.add(monthKey(d));
  }

  return [...byMonth.entries()]
    .filter(([month]) => cutoffs.has(month))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { atGoal, measured }]) => ({
      month,
      pct: measured > 0 ? Math.round((atGoal / measured) * 100) : 0,
    }));
}
