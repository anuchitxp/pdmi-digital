import { prisma } from "./db";

export async function writeAudit(params: {
  entityType: string;
  entityId: string;
  action: "create" | "update" | "soft-delete";
  actor: string;
}) {
  await prisma.auditLog.create({ data: params });
}
