import type { LucideIcon } from "lucide-react";
import Card from "./Card";

const accentClasses = {
  sky: "bg-sky-100 text-sky-700",
  red: "bg-red-100 text-red-600",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
} as const;

export type StatAccent = keyof typeof accentClasses;

export default function StatCard({
  label,
  icon: Icon,
  accent = "sky",
  value,
  sub,
  children,
}: {
  label: string;
  icon: LucideIcon;
  accent?: StatAccent;
  value: React.ReactNode;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card hover>
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </h3>
      </div>
      <p className="stat-value mt-3 text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
        {value}
      </p>
      {sub ? <p className="mt-1 text-sm text-slate-500">{sub}</p> : null}
      {children}
    </Card>
  );
}
