import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

type AuditInput = {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: unknown;
  afterJson?: unknown;
  metadataJson?: unknown;
};

export async function createAuditLog(input: AuditInput) {
  const data: Prisma.AuditLogUncheckedCreateInput = {
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    beforeJson: (input.beforeJson as Prisma.InputJsonValue | undefined) ?? undefined,
    afterJson: (input.afterJson as Prisma.InputJsonValue | undefined) ?? undefined,
    metadataJson: (input.metadataJson as Prisma.InputJsonValue | undefined) ?? undefined,
  };

  await prisma.auditLog.create({ data });
}
