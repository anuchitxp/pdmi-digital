"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { getHospital, parseChecklistItems } from "@/lib/queries";
import { isValid, validate, type Field } from "@/lib/validation";
import type { ChecklistItemState, ChecklistStatus } from "@/lib/checklists";
import { evaluateLdlGoal } from "@/lib/goals";

function num(v: FormDataEntryValue | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fieldErrors(errors: Record<string, string>, field: Field, label: string, value: number | null) {
  if (value === null) return;
  const err = validate(field, value);
  if (err) errors[label] = err;
}

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export async function createPatient(formData: FormData) {
  const hospital = await getHospital();
  const codedId = String(formData.get("codedId") ?? "").trim();
  const age = num(formData.get("age"));
  const baselineLdlc = num(formData.get("baselineLdlc"));
  const lvef = num(formData.get("lvef"));
  const admissionDate = String(formData.get("admissionDate") ?? "");

  const errors: Record<string, string> = {};
  if (!codedId) errors.codedId = "Coded ID is required";
  if (age === null || !isValid("age", age)) errors.age = "Age must be 18–120";
  if (baselineLdlc !== null && !isValid("ldlc", baselineLdlc)) errors.baselineLdlc = "LDL-C must be 10–500 mg/dL";
  if (lvef !== null && !isValid("lvef", lvef)) errors.lvef = "LVEF must be 5–90 %";

  const existing = await prisma.patient.findFirst({
    where: { hospitalId: hospital.id, codedId, deletedAt: null },
  });
  if (existing) errors.codedId = "This coded ID already exists";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const patient = await prisma.patient.create({
    data: {
      hospitalId: hospital.id,
      codedId,
      age: age as number,
      sex: String(formData.get("sex") ?? "male"),
      acsType: String(formData.get("acsType") ?? "STEMI"),
      pci: formData.get("pci") === "on",
      recurrentEvents: Math.max(1, num(formData.get("recurrentEvents")) ?? 1),
      baselineLdlc,
      hasDiabetes: formData.get("hasDiabetes") === "on",
      lvef,
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
    },
  });

  await prisma.preDischargeChecklist.create({
    data: { patientId: patient.id, items: "[]" },
  });

  await writeAudit({
    entityType: "Patient",
    entityId: patient.id,
    action: "create",
    actor: String(formData.get("actor") ?? "unspecified"),
  });

  revalidatePath("/patients");
  redirect(`/patients/${patient.id}/pre-discharge`);
}

export async function softDeletePatient(formData: FormData) {
  const id = String(formData.get("patientId"));
  const now = new Date();
  await prisma.patient.update({ where: { id }, data: { deletedAt: now } });
  await writeAudit({
    entityType: "Patient",
    entityId: id,
    action: "soft-delete",
    actor: String(formData.get("actor") ?? "unspecified"),
  });
  revalidatePath("/patients");
  redirect("/patients");
}

// ---------------------------------------------------------------------------
// Pre-discharge checklist
// ---------------------------------------------------------------------------

export async function savePreDischargeChecklist(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const itemsJson = String(formData.get("items") ?? "[]");
  const items: ChecklistItemState[] = JSON.parse(itemsJson);

  const allAnswered = items.every((i) => i.status !== "pending");
  const dischargeDate = String(formData.get("dischargeDate") ?? "");

  const checklist = await prisma.preDischargeChecklist.upsert({
    where: { patientId },
    update: {
      items: itemsJson,
      completedAt: allAnswered ? new Date() : null,
    },
    create: { patientId, items: itemsJson },
  });

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
      nextVisitDate: dischargeDate
        ? new Date(new Date(dischargeDate).getTime() + 30 * 24 * 60 * 60 * 1000)
        : null,
    },
  });

  await writeAudit({
    entityType: "PreDischargeChecklist",
    entityId: checklist.id,
    action: "update",
    actor: String(formData.get("actor") ?? "unspecified"),
  });

  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}`);
}

// ---------------------------------------------------------------------------
// Visits
// ---------------------------------------------------------------------------

export async function createVisit(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const visitDateStr = String(formData.get("visitDate") ?? "");
  const visitDate = visitDateStr ? new Date(visitDateStr) : new Date();

  const ldlc = num(formData.get("ldlc"));
  const hba1c = num(formData.get("hba1c"));
  const systolic = num(formData.get("systolic"));
  const diastolic = num(formData.get("diastolic"));
  const nextVisitDateStr = String(formData.get("nextVisitDate") ?? "");

  const errors: Record<string, string> = {};
  fieldErrors(errors, "ldlc", "LDL-C", ldlc);
  fieldErrors(errors, "hba1c", "HbA1c", hba1c);
  fieldErrors(errors, "systolic", "Systolic BP", systolic);
  fieldErrors(errors, "diastolic", "Diastolic BP", diastolic);
  if (Object.keys(errors).length > 0) return { errors };

  const visit = await prisma.visit.create({
    data: {
      patientId,
      visitDate,
      visitType: String(formData.get("visitType") ?? "first-30-day"),
      nextVisitDate: nextVisitDateStr ? new Date(nextVisitDateStr) : null,
    },
  });

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });

  const ldlcPercentReduction =
    ldlc !== null && patient?.baselineLdlc
      ? Math.round(((patient.baselineLdlc - ldlc) / patient.baselineLdlc) * 1000) / 10
      : null;

  if (ldlc !== null || hba1c !== null) {
    await prisma.labResult.create({
      data: { visitId: visit.id, ldlc, hba1c, ldlcPercentReduction },
    });
  }
  if (systolic !== null || diastolic !== null) {
    await prisma.vitals.create({
      data: { visitId: visit.id, systolic, diastolic },
    });
  }

  const itemsJson = String(formData.get("items") ?? "[]");
  await prisma.postDischargeChecklist.create({
    data: { visitId: visit.id, items: itemsJson },
  });

  await prisma.medicationRegimen.create({
    data: {
      visitId: visit.id,
      aspirin: formData.get("aspirin") === "on",
      p2y12: (formData.get("p2y12") as string) || null,
      statinIntensity: (formData.get("statinIntensity") as string) || null,
      nonStatin: (formData.get("nonStatin") as string) || null,
      aceiOrArb: (formData.get("aceiOrArb") as string) || null,
      betaBlocker: (formData.get("betaBlocker") as string) || null,
      sglt2i: formData.get("sglt2i") === "on",
      glp1ra: formData.get("glp1ra") === "on",
    },
  });

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      nextVisitDate: nextVisitDateStr ? new Date(nextVisitDateStr) : null,
    },
  });

  await writeAudit({
    entityType: "Visit",
    entityId: visit.id,
    action: "create",
    actor: String(formData.get("actor") ?? "unspecified"),
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/");
  redirect(`/patients/${patientId}`);
}

export async function softDeleteVisit(formData: FormData) {
  const visitId = String(formData.get("visitId"));
  const patientId = String(formData.get("patientId"));
  await prisma.visit.update({ where: { id: visitId }, data: { deletedAt: new Date() } });
  await writeAudit({
    entityType: "Visit",
    entityId: visitId,
    action: "soft-delete",
    actor: String(formData.get("actor") ?? "unspecified"),
  });
  revalidatePath(`/patients/${patientId}`);
}
