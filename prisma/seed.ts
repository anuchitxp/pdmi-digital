// Seed with obviously fake demo patients (coded IDs P-TEST-xxx) — no real identifiers.
import { PrismaClient } from "@prisma/client";
import { initChecklistItems, PRE_DISCHARGE_ITEMS, POST_DISCHARGE_MANDATORY_ITEMS, POST_DISCHARGE_OPTIONAL_ITEMS } from "../src/lib/checklists";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * DAY);

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.labResult.deleteMany(),
    prisma.vitals.deleteMany(),
    prisma.medicationRegimen.deleteMany(),
    prisma.postDischargeChecklist.deleteMany(),
    prisma.visit.deleteMany(),
    prisma.preDischargeChecklist.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.hospital.deleteMany(),
  ]);

  const hospital = await prisma.hospital.create({
    data: { code: "H01", name: "Udon Thani Hospital (Demo)" },
  });

  const demo = [
    {
      codedId: "H01-P-TEST-001",
      age: 58,
      sex: "male",
      acsType: "STEMI",
      pci: true,
      recurrentEvents: 1,
      baselineLdlc: 145,
      hasDiabetes: true,
      lvef: 42,
      admissionDate: daysAgo(120),
      dischargeDate: daysAgo(114),
      // well controlled: LDL 48 (-67%), BP 118/74, HbA1c 6.4
      visit: { ldlc: 48, hba1c: 6.4, systolic: 118, diastolic: 74, daysAgo: 90 },
    },
    {
      codedId: "H01-P-TEST-002",
      age: 72,
      sex: "female",
      acsType: "NSTEMI",
      pci: true,
      recurrentEvents: 1,
      baselineLdlc: 160,
      hasDiabetes: false,
      lvef: 55,
      admissionDate: daysAgo(200),
      dischargeDate: daysAgo(195),
      // LDL 62 (-61% reduction but ≥55 → not at absolute target); BP 138/86 ok for >65–79
      visit: { ldlc: 62, hba1c: null, systolic: 138, diastolic: 86, daysAgo: 60 },
    },
    {
      codedId: "H01-P-TEST-003",
      age: 64,
      sex: "male",
      acsType: "UA",
      pci: false,
      recurrentEvents: 2,
      baselineLdlc: 130,
      hasDiabetes: true,
      lvef: 38,
      admissionDate: daysAgo(150),
      dischargeDate: daysAgo(146),
      // recurrent events → target <40; LDL 45 not at goal; HbA1c 7.8 not at goal
      visit: { ldlc: 45, hba1c: 7.8, systolic: 150, diastolic: 88, daysAgo: 40 },
    },
    {
      codedId: "H01-P-TEST-004",
      age: 49,
      sex: "female",
      acsType: "STEMI",
      pci: true,
      recurrentEvents: 1,
      baselineLdlc: 110,
      hasDiabetes: false,
      lvef: 60,
      admissionDate: daysAgo(10),
      dischargeDate: daysAgo(6),
      // just discharged, no visit yet — first visit due within 30 days
      visit: null,
    },
  ];

  for (const p of demo) {
    const patient = await prisma.patient.create({
      data: {
        hospitalId: hospital.id,
        codedId: p.codedId,
        age: p.age,
        sex: p.sex,
        acsType: p.acsType,
        pci: p.pci,
        recurrentEvents: p.recurrentEvents,
        baselineLdlc: p.baselineLdlc,
        hasDiabetes: p.hasDiabetes,
        lvef: p.lvef,
        admissionDate: p.admissionDate,
        dischargeDate: p.dischargeDate,
        nextVisitDate: p.visit ? daysAgo(p.visit.daysAgo - 90) : daysAgo(-24),
      },
    });

    await prisma.preDischargeChecklist.create({
      data: {
        patientId: patient.id,
        items: JSON.stringify(initChecklistItems(PRE_DISCHARGE_ITEMS)),
        completedAt: p.dischargeDate,
      },
    });

    if (p.visit) {
      const visit = await prisma.visit.create({
        data: {
          patientId: patient.id,
          visitDate: daysAgo(p.visit.daysAgo),
          visitType: "3-6-month",
          nextVisitDate: daysAgo(p.visit.daysAgo - 90),
        },
      });

      const items = [
        ...initChecklistItems(POST_DISCHARGE_MANDATORY_ITEMS),
        ...initChecklistItems(POST_DISCHARGE_OPTIONAL_ITEMS),
      ];
      await prisma.postDischargeChecklist.create({
        data: { visitId: visit.id, items: JSON.stringify(items) },
      });

      await prisma.labResult.create({
        data: {
          visitId: visit.id,
          ldlc: p.visit.ldlc,
          hba1c: p.visit.hba1c,
          ldlcPercentReduction:
            p.baselineLdlc && p.visit.ldlc
              ? Math.round(((p.baselineLdlc - p.visit.ldlc) / p.baselineLdlc) * 1000) / 10
              : null,
        },
      });

      await prisma.vitals.create({
        data: {
          visitId: visit.id,
          systolic: p.visit.systolic,
          diastolic: p.visit.diastolic,
        },
      });

      await prisma.medicationRegimen.create({
        data: {
          visitId: visit.id,
          aspirin: true,
          p2y12: "ticagrelor",
          statinIntensity: "high",
          aceiOrArb: "perindopril",
          betaBlocker: p.lvef !== null && p.lvef <= 40 ? "bisoprolol" : null,
          sglt2i: p.hasDiabetes,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        entityType: "Patient",
        entityId: patient.id,
        action: "create",
        actor: "seed",
      },
    });
  }

  console.log(`Seeded ${demo.length} demo patients for hospital ${hospital.code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
