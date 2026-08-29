import { listPatients, goalsForPatient } from "@/lib/queries";
import { evaluateLdlGoal } from "@/lib/goals";
import { toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

function csvEscape(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const patients = await listPatients();
  const header = [
    "codedId",
    "age",
    "sex",
    "acsType",
    "pci",
    "recurrentEvents",
    "hasDiabetes",
    "baselineLdlc",
    "latestLdlc",
    "ldlcPercentReduction",
    "ldlGoal",
    "bpGoal",
    "hba1cGoal",
    "dischargeDate",
    "nextVisitDate",
    "visitCount",
  ];
  const rows = patients.map((p) => {
    const goals = goalsForPatient(p);
    const lab = p.visits[0]?.labResults[0];
    const ldl = evaluateLdlGoal({
      ldlc: lab?.ldlc ?? null,
      baselineLdlc: p.baselineLdlc,
      recurrentEvents: p.recurrentEvents,
    });
    return [
      p.codedId,
      p.age,
      p.sex,
      p.acsType,
      p.pci ? "yes" : "no",
      p.recurrentEvents,
      p.hasDiabetes ? "yes" : "no",
      p.baselineLdlc,
      lab?.ldlc ?? "",
      ldl.percentReduction ?? "",
      goals.ldl,
      goals.bp,
      goals.hba1c,
      toDateInputValue(p.dischargeDate),
      toDateInputValue(p.nextVisitDate),
      p.visits.length,
    ];
  });

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pdmi-registry-${toDateInputValue(new Date())}.csv"`,
    },
  });
}
