import Link from "next/link";
import { listPatients, goalsForPatient } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Card from "@/components/Card";

export const dynamic = "force-dynamic";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = await searchParams;
  const all = await listPatients();
  const q = (query ?? "").trim().toLowerCase();
  const patients = q
    ? all.filter((p) => p.codedId.toLowerCase().includes(q))
    : all;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Patients</h1>
        <div className="flex gap-2">
          <a
            href="/api/export"
            className="rounded-lg border border-slate-400 px-4 py-2.5 hover:bg-slate-50"
          >
            Export CSV
          </a>
          <Link
            href="/patients/new"
            className="rounded-lg bg-sky-700 px-4 py-2.5 text-white hover:bg-sky-800"
          >
            + Add patient
          </Link>
        </div>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query ?? ""}
          placeholder="Search by coded ID…"
          className="max-w-xs"
        />
        <button type="submit" className="rounded-lg bg-slate-700 px-4 py-2.5 text-white">
          Search
        </button>
      </form>

      <Card className="!p-0 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Coded ID</th>
              <th className="px-4 py-3">Age/Sex</th>
              <th className="px-4 py-3">ACS</th>
              <th className="px-4 py-3">Discharged</th>
              <th className="px-4 py-3">LDL-C</th>
              <th className="px-4 py-3">BP</th>
              <th className="px-4 py-3">HbA1c</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((p) => {
              const goals = goalsForPatient(p);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/patients/${p.id}`} className="font-medium text-sky-700 hover:underline">
                      {p.codedId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {p.age} / {p.sex === "male" ? "M" : "F"}
                  </td>
                  <td className="px-4 py-3">
                    {p.acsType}
                    {p.recurrentEvents > 1 ? ` (×${p.recurrentEvents})` : ""}
                  </td>
                  <td className="px-4 py-3">{formatDate(p.dischargeDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={goals.ldl} /></td>
                  <td className="px-4 py-3"><StatusBadge status={goals.bp} /></td>
                  <td className="px-4 py-3"><StatusBadge status={goals.hba1c} /></td>
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
