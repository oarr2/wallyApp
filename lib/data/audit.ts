import type { AuditEntityType, AuditSource, Prisma, UserRole } from "@prisma/client";
import prisma from "@/lib/data/prisma";

export type AuditClient = Pick<Prisma.TransactionClient, "auditRecord">;

export type AppendAuditRecordInput = {
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  actorUserId?: string | null;
  actorRole?: UserRole | null;
  source: AuditSource;
  beforeState?: Prisma.InputJsonValue | null;
  afterState?: Prisma.InputJsonValue | null;
  reason?: string | null;
  requestId?: string | null;
  reservationId?: string | null;
  paymentId?: string | null;
  courtId?: string | null;
  sportId?: string | null;
  scheduleRuleId?: string | null;
  availabilityOverrideId?: string | null;
};

export async function appendAuditRecord(
  input: AppendAuditRecordInput,
  client: AuditClient = prisma
) {
  return client.auditRecord.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actorUserId: input.actorUserId ?? null,
      actorRole: input.actorRole ?? null,
      source: input.source,
      beforeState: input.beforeState ?? undefined,
      afterState: input.afterState ?? undefined,
      reason: input.reason ?? null,
      requestId: input.requestId ?? null,
      reservationId: input.reservationId ?? null,
      paymentId: input.paymentId ?? null,
      courtId: input.courtId ?? null,
      sportId: input.sportId ?? null,
      scheduleRuleId: input.scheduleRuleId ?? null,
      availabilityOverrideId: input.availabilityOverrideId ?? null
    }
  });
}
