import { prisma } from "./db";
import { isFollowUpOverdue } from "./goals";
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

  return {
    totalPatients: patients.length,
    ldl: { atGoal: ldlAtGoal, measured: ldlMeasured },
    bp: { atGoal: bpAtGoal, measured: bpMeasured },
    hba1c: { atGoal: hba1cAtGoal, measured: hba1cMeasured },
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
