import { notFound } from "next/navigation";
import { getPatient } from "@/lib/queries";
import VisitForm from "@/components/VisitForm";
import { evaluateBpGoal, evaluateHba1cGoal, evaluateLdlGoal } from "@/lib/goals";
import { toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const today = toDateInputValue(new Date());
  const nextSuggested = toDateInputValue(
    new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000),
  );

  const ldl = evaluateLdlGoal({
    ldlc: null,
    baselineLdlc: patient.baselineLdlc,
    recurrentEvents: patient.recurrentEvents,
  });
  const bp = evaluateBpGoal({ age: patient.age, systolic: null, diastolic: null });
  const hba1c = evaluateHba1cGoal({ hasDiabetes: patient.hasDiabetes, hba1c: null });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New visit — {patient.codedId}</h1>
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm">
        <p className="font-semibold text-sky-900">Target goals at visit</p>
        <ul className="mt-1 list-disc pl-5">
          <li>
            LDL-C: &lt;{ldl.targetMgDl} mg/dL and ≥50% reduction
            {patient.baselineLdlc ? ` (baseline ${patient.baselineLdlc} mg/dL)` : ""}
          </li>
          <li>
            BP: &lt;{bp.target.systolicMax}
            {bp.target.systolicBandMax ? `–${bp.target.systolicBandMax}` : ""}/&lt;
            {bp.target.diastolicMax} mmHg ({bp.target.ageBand} years)
          </li>
          {patient.hasDiabetes && <li>HbA1c: &lt;{hba1c.targetPercent}% (individualised)</li>}
        </ul>
      </div>
      <VisitForm
        patientId={patient.id}
        defaultVisitDate={today}
        defaultNextVisitDate={nextSuggested}
      />
    </div>
  );
}
