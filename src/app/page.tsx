import Link from "next/link";
import { getDashboardData } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function GoalCard({
  title,
  atGoal,
  measured,
}: {
  title: string;
  atGoal: number;
  measured: number;
}) {
  const pct = measured > 0 ? Math.round((atGoal / measured) * 100) : 0;
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <p className="mt-2 text-4xl font-bold text-sky-900">{pct}%</p>
      <div className="mt-2 h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {atGoal} of {measured} measured patients
      </p>
    </div>
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
          className="rounded-lg bg-sky-700 px-4 py-2.5 text-white hover:bg-sky-800"
        >
          + Add patient
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-sm font-semibold text-slate-500">Patients</h3>
          <p className="mt-2 text-4xl font-bold text-sky-900">{data.totalPatients}</p>
          <p className="mt-2 text-sm text-slate-500">active in registry</p>
        </div>
        <GoalCard title="LDL-C at goal" {...data.ldl} />
        <GoalCard title="BP at goal" {...data.bp} />
        <GoalCard title="HbA1c at goal" {...data.hba1c} />
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 text-lg font-semibold text-red-700">
          Overdue follow-ups ({data.overdue.length})
        </h2>
        {data.overdue.length === 0 ? (
          <p className="text-sm text-slate-500">No overdue follow-ups.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.overdue.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <Link href={`/patients/${p.id}`} className="font-medium text-sky-700 hover:underline">
                  {p.codedId}
                </Link>
                <span className="text-sm text-slate-500">
                  Scheduled: {formatDate(p.nextVisitDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
