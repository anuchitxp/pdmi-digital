import { prisma } from "./db";
import { isFollowUpOverdue } from "./goals";
import { monthlyAtGoalTrend, monthKey } from "./trends";
import type { GoalStatus } from "./goals/types";
import type { ChecklistItemState } from "./checklists";

export interface PatientGoals {
  ldl: GoalStatus;
  bp: GoalStatus;
  hba1c: GoalStatus;
}

export type PatientWithLatest = Awaited<ReturnType<typeof listPatients>>[number];

export async function getHospital() {
  let hospital = await prisma.hospital.findFirst();
  if (!hospital) {
    hospital = await prisma.hospital.create({
      data: { code: "H01", name: "Udon Thani Hospital" },
    });
  }
  return hospital;
}

const patientInclude = {
  visits: {
    where: { deletedAt: null },
    orderBy: { visitDate: "desc" as const },
    include: {
      checklist: true,
      labResults: { where: { deletedAt: null } },
      vitals: { where: { deletedAt: null } },
      medications: { where: { deletedAt: null } },
    },
  },
  preDischargeChecklist: true,
};

export function listPatients() {
  return prisma.patient.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: patientInclude,
  });
}

export async function getPatient(id: string) {
  return prisma.patient.findFirst({
    where: { id, deletedAt: null },
    include: patientInclude,
  });
}

export async function getDashboardData() {
  const patients = await listPatients();
  const today = new Date();

  let ldlAtGoal = 0;
  let ldlMeasured = 0;
  let bpAtGoal = 0;
  let bpMeasured = 0;
  let hba1cAtGoal = 0;
  let hba1cMeasured = 0;

  for (const p of patients) {
    const g = goalsForPatient(p);
    if (g.ldl !== "unknown") {
      ldlMeasured++;
      if (g.ldl === "achieved") ldlAtGoal++;
    }
    if (g.bp !== "unknown") {
      bpMeasured++;
      if (g.bp === "achieved") bpAtGoal++;
    }
    if (g.hba1c !== "unknown") {
      hba1cMeasured++;
      if (g.hba1c === "achieved") hba1cAtGoal++;
    }
  }

  const overdue = patients
    .filter((p) => {
      const lastVisit = p.visits[0]?.visitDate ?? null;
      return isFollowUpOverdue(today, lastVisit, p.nextVisitDate);
    })
    .map((p) => ({ id: p.id, codedId: p.codedId, nextVisitDate: p.nextVisitDate }));

  // Monthly at-goal trend rows: evaluate the goal engine per visit so the
  // thresholds themselves stay in src/lib/goals.
  const ldlRows: { month: string; status: GoalStatus }[] = [];
  const bpRows: { month: string; status: GoalStatus }[] = [];
  const hba1cRows: { month: string; status: GoalStatus }[] = [];
  for (const p of patients) {
    for (const visit of p.visits) {
      const month = monthKey(visit.visitDate);
      const lab = visit.labResults.find((l) => l.ldlc != null) ?? null;
      const labHba1c = visit.labResults.find((l) => l.hba1c != null) ?? null;
      const vit = visit.vitals.find((v) => v.systolic != null) ?? null;
      ldlRows.push({
        month,
        status: evaluateLdlGoal({
          ldlc: lab?.ldlc ?? null,
          baselineLdlc: p.baselineLdlc,
          recurrentEvents: p.recurrentEvents,
        }).achieved,
      });
      bpRows.push({
        month,
        status: evaluateBpGoal({
          age: p.age,
          systolic: vit?.systolic ?? null,
          diastolic: vit?.diastolic ?? null,
        }).achieved,
      });
      hba1cRows.push({
        month,
        status: evaluateHba1cGoal({
          hasDiabetes: p.hasDiabetes,
          hba1c: labHba1c?.hba1c ?? null,
        }).achieved,
      });
    }
  }

  return {
    totalPatients: patients.length,
    ldl: { atGoal: ldlAtGoal, measured: ldlMeasured },
    bp: { atGoal: bpAtGoal, measured: bpMeasured },
    hba1c: { atGoal: hba1cAtGoal, measured: hba1cMeasured },
    trends: {
      ldl: monthlyAtGoalTrend(ldlRows, today),
      bp: monthlyAtGoalTrend(bpRows, today),
      hba1c: monthlyAtGoalTrend(hba1cRows, today),
    },
    overdue,
  };
}

import { evaluateBpGoal, evaluateHba1cGoal, evaluateLdlGoal } from "./goals";

export function goalsForPatient(patient: {
  age: number;
  recurrentEvents: number;
  baselineLdlc: number | null;
  hasDiabetes: boolean;
  visits: {
    labResults: { ldlc: number | null; hba1c: number | null }[];
    vitals: { systolic: number | null; diastolic: number | null }[];
  }[];
}): PatientGoals {
  const latest = patient.visits[0];
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
  const hba1c = evaluateHba1cGoal({
    hasDiabetes: patient.hasDiabetes,
    hba1c: lab?.hba1c ?? null,
  });

  return { ldl: ldl.achieved, bp: bp.achieved, hba1c: hba1c.achieved };
}

export function parseChecklistItems(json: string | null | undefined): ChecklistItemState[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as ChecklistItemState[]) : [];
  } catch {
    return [];
  }
}
