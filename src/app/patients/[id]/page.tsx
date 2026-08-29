import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient, goalsForPatient, parseChecklistItems } from "@/lib/queries";
import { evaluateBpGoal, evaluateLdlGoal } from "@/lib/goals";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import LdlTrendChart from "@/components/LdlTrendChart";
import { softDeletePatient, softDeleteVisit } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const goals = goalsForPatient(patient);
  const latest = patient.visits[0] ?? null;
  const lab = latest?.labResults[0] ?? null;
  const vit = latest?.vitals[0] ?? null;

  const ldl = evaluateLdlGoal({
    ldlc: lab?.ldlc ?? null,
    baselineLdlc: patient.baselineLdlc,
    recurrentEvents: patient.recurrentEvents,
  });
  const bp = evaluateBpGoal({
    age: patient.age,
    systolic: vit?.systolic ?? null,
    diastolic: vit?.diastolic ?? null,
  });

  const trend = [...patient.visits]
    .reverse()
    .map((v) => ({
      date: formatDate(v.visitDate),
      ldlc: v.labResults[0]?.ldlc ?? null,
    }))
    .filter((d): d is { date: string; ldlc: number } => d.ldlc !== null);

  const preItems = parseChecklistItems(patient.preDischargeChecklist?.items);
  const preAnswered = preItems.filter((i) => i.status !== "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{patient.codedId}</h1>
          <p className="text-sm text-slate-500">
            {patient.age} y/o {patient.sex} · {patient.acsType}
            {patient.pci ? " · PCI" : ""}
            {patient.recurrentEvents > 1 ? ` · ${patient.recurrentEvents} events` : ""}
            {patient.hasDiabetes ? " · diabetes" : ""}
            {patient.lvef !== null ? ` · LVEF ${patient.lvef}%` : ""}
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Link
            href={`/patients/${patient.id}/pre-discharge`}
            className="rounded-lg bg-slate-700 px-4 py-2.5 text-white hover:bg-slate-800"
          >
            Pre-discharge checklist
          </Link>
          <Link
            href={`/patients/${patient.id}/visits/new`}
            className="rounded-lg bg-sky-700 px-4 py-2.5 text-white hover:bg-sky-800"
          >
            + New visit
          </Link>
          <Link
            href={`/patients/${patient.id}/print`}
            className="rounded-lg border border-slate-400 px-4 py-2.5"
          >
            Print
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-sm font-semibold text-slate-500">LDL-C goal</h3>
          <div className="mt-2"><StatusBadge status={goals.ldl} /></div>
          <p className="mt-2 text-sm text-slate-600">
            Target &lt;{ldl.targetMgDl} mg/dL and ≥50% reduction
            {patient.baselineLdlc ? ` from baseline ${patient.baselineLdlc}` : ""}
          </p>
          {ldl.currentLdlc !== null && (
            <p className="mt-1 text-sm">
              Latest: {ldl.currentLdlc} mg/dL
              {ldl.percentReduction !== null ? ` (${ldl.percentReduction}% reduction)` : ""}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-sm font-semibold text-slate-500">BP goal</h3>
          <div className="mt-2"><StatusBadge status={goals.bp} /></div>
          <p className="mt-2 text-sm text-slate-600">
            Target &lt;{bp.target.systolicMax}
            {bp.target.systolicBandMax ? `–${bp.target.systolicBandMax}` : ""}/&lt;
            {bp.target.diastolicMax} mmHg ({bp.target.ageBand} y)
          </p>
          {bp.systolic !== null && bp.diastolic !== null && (
            <p className="mt-1 text-sm">Latest: {bp.systolic}/{bp.diastolic} mmHg</p>
          )}
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-sm font-semibold text-slate-500">HbA1c goal</h3>
          <div className="mt-2"><StatusBadge status={goals.hba1c} /></div>
          <p className="mt-2 text-sm text-slate-600">
            {patient.hasDiabetes ? "Target <7% (individualised)" : "Non-diabetic — not applicable"}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 font-semibold">LDL-C trend</h2>
        <LdlTrendChart data={trend} target={ldl.targetMgDl} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-3 font-semibold">Key dates</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Admission</dt><dd>{formatDate(patient.admissionDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Discharge</dt><dd>{formatDate(patient.dischargeDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Next visit</dt><dd>{formatDate(patient.nextVisitDate)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Pre-discharge checklist</dt>
              <dd>{preItems.length > 0 ? `${preAnswered}/${preItems.length} answered` : "not started"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-3 font-semibold">Audit</h2>
          <form action={softDeletePatient} className="no-print">
            <input type="hidden" name="patientId" value={patient.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-300 px-4 py-2.5 text-red-700 hover:bg-red-50"
            >
              Remove from registry (soft delete)
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            Records are never hard-deleted — QI data is preserved.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 font-semibold">Visit timeline</h2>
        {patient.visits.length === 0 ? (
          <p className="text-sm text-slate-500">No visits recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {patient.visits.map((v) => {
              const l = v.labResults[0];
              const vt = v.vitals[0];
              const med = v.medications[0];
              return (
                <li key={v.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold">{formatDate(v.visitDate)}</span>
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600">
                        {v.visitType}
                      </span>
                    </div>
                    <form action={softDeleteVisit} className="no-print">
                      <input type="hidden" name="visitId" value={v.id} />
                      <input type="hidden" name="patientId" value={patient.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">
                        Delete visit
                      </button>
                    </form>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                    {l?.ldlc != null && <span>LDL-C: {l.ldlc} mg/dL{l.ldlcPercentReduction != null ? ` (${l.ldlcPercentReduction}%)` : ""}</span>}
                    {l?.hba1c != null && <span>HbA1c: {l.hba1c}%</span>}
                    {vt?.systolic != null && <span>BP: {vt.systolic}/{vt.diastolic} mmHg</span>}
                    {med && (
                      <span>
                        Meds: {[med.aspirin && "aspirin", med.p2y12, med.statinIntensity && `${med.statinIntensity}-intensity statin`, med.nonStatin, med.aceiOrArb, med.betaBlocker, med.sglt2i && "SGLT2i", med.glp1ra && "GLP-1 RA"].filter(Boolean).join(", ") || "none recorded"}
                      </span>
                    )}
                    {v.nextVisitDate && <span>Next: {formatDate(v.nextVisitDate)}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
