import type { GoalStatus } from "@/lib/goals/types";

const styles: Record<GoalStatus, string> = {
  achieved: "bg-green-100 text-green-800",
  "not-achieved": "bg-red-100 text-red-800",
  unknown: "bg-slate-200 text-slate-600",
};

const labels: Record<GoalStatus, string> = {
  achieved: "At goal",
  "not-achieved": "Not at goal",
  unknown: "No data",
};

export default function StatusBadge({ status }: { status: GoalStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
