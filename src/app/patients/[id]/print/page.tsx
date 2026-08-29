import { notFound } from "next/navigation";
import { getPatient, parseChecklistItems } from "@/lib/queries";
import {
  PRE_DISCHARGE_ITEMS,
  POST_DISCHARGE_MANDATORY_ITEMS,
  POST_DISCHARGE_OPTIONAL_ITEMS,
} from "@/lib/checklists";
import { evaluateBpGoal, evaluateLdlGoal } from "@/lib/goals";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function statusLabel(s: string | undefined) {
  if (s === "yes") return "Yes";
  if (s === "no") return "No";
  if (s === "na") return "N/A";
  return "—";
}

export default async function PrintPage({ params }: { params: { id: string } }) {
  const patient = await getPatient(params.id);
  if (!patient) notFound();

  const ldl = evaluateLdlGoal({
    ldlc: null,
    baselineLdlc: patient.baselineLdlc,
    recurrentEvents: patient.recurrentEvents,
  });
  const bp = evaluateBpGoal({ age: patient.age, systolic: null, diastolic: null });

  const preItems = parseChecklistItems(patient.preDischargeChecklist?.items);
  const latestVisit = patient.visits[0];
  const postItems = latestVisit ? parseChecklistItems(latestVisit.checklist?.items) : [];

  return (
    <div className="print-full mx-auto max-w-3xl space-y-6 rounded-xl bg-white p-8 shadow">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">PDMI — Post-ACS Care Record</h1>
        <span className="text-sm text-slate-500">{patient.codedId}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>Age/Sex: {patient.age} / {patient.sex}</p>
        <p>ACS: {patient.acsType}{patient.pci ? " (PCI)" : ""}</p>
        <p>Events: {patient.recurrentEvents}</p>
        <p>Diabetes: {patient.hasDiabetes ? "yes" : "no"}</p>
        <p>Admission: {formatDate(patient.admissionDate)}</p>
        <p>Discharge: {formatDate(patient.dischargeDate)}</p>
      </div>

      <div className="rounded border border-slate-300 p-3 text-sm">
        <p className="font-semibold">Target goals</p>
        <p>LDL-C: &lt;{ldl.targetMgDl} mg/dL and ≥50% reduction (baseline {patient.baselineLdlc ?? "—"} mg/dL)</p>
        <p>BP: &lt;{bp.target.systolicMax}{bp.target.systolicBandMax ? `–${bp.target.systolicBandMax}` : ""}/&lt;{bp.target.diastolicMax} mmHg ({bp.target.ageBand} y)</p>
        {patient.hasDiabetes && <p>HbA1c: &lt;7% (individualised)</p>}
      </div>

      <section>
        <h2 className="mb-2 font-semibold">Pre-discharge checklist (§6)</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-1">No.</th><th>Item</th><th>Status</th><th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {PRE_DISCHARGE_ITEMS.map((def) => {
              const st = preItems.find((i) => i.itemNo === def.itemNo);
              return (
                <tr key={def.itemNo} className="border-b border-slate-100">
                  <td className="py-1">{def.itemNo}</td>
                  <td>{def.text}</td>
                  <td>{statusLabel(st?.status)}</td>
                  <td>{st?.notes ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">
          Latest visit — post-discharge checklist (§7){latestVisit ? `, ${formatDate(latestVisit.visitDate)}` : ""}
        </h2>
        {latestVisit ? (
          <table className="w-full text-left text-sm">
            <tbody>
              {[...POST_DISCHARGE_MANDATORY_ITEMS.map((d) => ({ ...d, part: "M" })), ...POST_DISCHARGE_OPTIONAL_ITEMS.map((d) => ({ ...d, part: "O" }))].map((def) => {
                const st = postItems.find((i) => i.itemNo === def.itemNo);
                return (
                  <tr key={`${def.part}-${def.itemNo}`} className="border-b border-slate-100">
                    <td className="py-1 w-10">{def.part}-{def.itemNo}</td>
                    <td>{def.text}</td>
                    <td>{statusLabel(st?.status)}</td>
                    <td>{st?.notes ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">No visits recorded.</p>
        )}
      </section>

      <p className="no-print text-sm text-slate-500">
        Use your browser&apos;s print function (Ctrl/Cmd+P) to print this page.
      </p>
    </div>
  );
}
