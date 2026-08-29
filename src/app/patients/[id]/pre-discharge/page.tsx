import { notFound } from "next/navigation";
import { getPatient, parseChecklistItems } from "@/lib/queries";
import ChecklistForm from "@/components/ChecklistForm";
import { toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PreDischargePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const items = parseChecklistItems(patient.preDischargeChecklist?.items);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Pre-discharge checklist — {patient.codedId}
      </h1>
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm">
        <p className="font-semibold text-sky-900">Target goals at discharge</p>
        <ul className="mt-1 list-disc pl-5">
          <li>
            LDL-C: &lt;{patient.recurrentEvents >= 2 ? 40 : 55} mg/dL
            {patient.recurrentEvents >= 2 ? " (≥2 recurrent events)" : ""} and ≥50% reduction
            from baseline
            {patient.baselineLdlc ? ` (baseline ${patient.baselineLdlc} mg/dL)` : ""}
          </li>
          <li>Blood pressure: per age band ({patient.age} years — see visit goals)</li>
          {patient.hasDiabetes && <li>HbA1c: &lt;7% (individualised)</li>}
        </ul>
      </div>
      <ChecklistForm
        patientId={patient.id}
        initialItems={items}
        dischargeDate={toDateInputValue(patient.dischargeDate)}
      />
    </div>
  );
}
