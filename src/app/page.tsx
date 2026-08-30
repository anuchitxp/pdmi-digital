import Link from "next/link";
import { CalendarClock, Droplet, Gauge as GaugeIcon, HeartPulse, Users } from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import Card from "@/components/Card";
import StatCard, { type StatAccent } from "@/components/StatCard";
import Gauge from "@/components/Gauge";
import TrendSparkline from "@/components/TrendSparkline";
import AlertBanner from "@/components/AlertBanner";

export const dynamic = "force-dynamic";

function GoalStatCard({
  title,
  icon,
  accent,
  atGoal,
  measured,
  trend,
  trendColor,
}: {
  title: string;
  icon: typeof Users;
  accent: StatAccent;
  atGoal: number;
  measured: number;
  trend: { month: string; pct: number }[];
  trendColor: string;
}) {
  const pct = measured > 0 ? Math.round((atGoal / measured) * 100) : 0;
  return (
    <StatCard
      label={title}
      icon={icon}
      accent={accent}
      value={measured > 0 ? `${pct}%` : "—"}
      sub={`${atGoal} of ${measured} measured patients`}
    >
      {measured > 0 ? (
        <div className="mt-3" title={`${atGoal} at goal out of ${measured} measured`}>
          <Gauge pct={pct} size={96} />
        </div>
      ) : null}
      <TrendSparkline data={trend} color={trendColor} />
    </StatCard>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/patients/new"
          className="rounded-lg bg-sky-700 px-4 py-2.5 text-white transition-colors hover:bg-sky-800"
        >
          + Add patient
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Patients"
          icon={Users}
          accent="sky"
          value={data.totalPatients}
          sub="active in registry"
        />
        <GoalStatCard
          title="LDL-C at goal"
          icon={HeartPulse}
          accent="red"
          trendColor="#ef4444"
          {...data.ldl}
          trend={data.trends.ldl}
        />
        <GoalStatCard
          title="BP at goal"
          icon={GaugeIcon}
          accent="green"
          trendColor="#10b981"
          {...data.bp}
          trend={data.trends.bp}
        />
        <GoalStatCard
          title="HbA1c at goal"
          icon={Droplet}
          accent="purple"
          trendColor="#8b5cf6"
          {...data.hba1c}
          trend={data.trends.hba1c}
        />
      </div>

      {data.overdue.length === 0 ? (
        <AlertBanner variant="success">
          No overdue follow-ups — everything is on schedule.
        </AlertBanner>
      ) : (
        <>
          <AlertBanner variant="warning">
            {data.overdue.length} overdue follow-up{data.overdue.length > 1 ? "s" : ""} —
            patients past their scheduled visit date.
          </AlertBanner>
          <Card>
            <ul className="divide-y divide-slate-100">
              {data.overdue.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <Link
                    href={`/patients/${p.id}`}
                    className="font-medium text-sky-700 hover:underline"
                  >
                    {p.codedId}
                  </Link>
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CalendarClock className="h-4 w-4" aria-hidden />
                    Scheduled: {formatDate(p.nextVisitDate)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
