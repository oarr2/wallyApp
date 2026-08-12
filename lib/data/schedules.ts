import {
  AuditEntityType,
  AuditSource,
  type Prisma,
  type ScheduleRule
} from "@prisma/client";
import prisma from "@/lib/data/prisma";
import { canManageVenue } from "@/lib/auth/authorization";
import { appendAuditRecord } from "@/lib/data/audit";
import type { UserProfileWithVenue } from "@/lib/data/user-profiles";
import {
  assertValidTimeRange,
  dateToLocalTimeString,
  getLaPazDayOfWeek,
  localDateAndMinutesToUtc,
  timeDateToMinutes
} from "@/lib/time/la-paz";
import type { ScheduleRuleInput } from "@/lib/validation/admin";

export type GeneratedSlot = {
  courtId: string;
  scheduleRuleId: string | null;
  localDate: string;
  startLocalTime: string;
  endLocalTime: string;
  startMinutes: number;
  endMinutes: number;
  startAtUtc: Date;
  endAtUtc: Date;
};

export type ScheduleRuleForSlots = Pick<
  ScheduleRule,
  | "id"
  | "courtId"
  | "dayOfWeek"
  | "startLocalTime"
  | "endLocalTime"
  | "slotMinutes"
  | "isActive"
>;

export type ScheduleClient = Pick<
  Prisma.TransactionClient,
  "auditRecord" | "court" | "scheduleRule"
>;

type TransactionRunner = Pick<typeof prisma, "$transaction">;

export async function listActiveScheduleRulesForCourtDate(
  input: { courtId: string; localDate: string },
  client: ScheduleClient = prisma
): Promise<ScheduleRule[]> {
  return client.scheduleRule.findMany({
    where: {
      courtId: input.courtId,
      dayOfWeek: getLaPazDayOfWeek(input.localDate),
      isActive: true
    },
    orderBy: [{ startLocalTime: "asc" }, { endLocalTime: "asc" }]
  });
}

export async function generateSlotsForCourtDate(
  input: { courtId: string; localDate: string },
  client: ScheduleClient = prisma
): Promise<GeneratedSlot[]> {
  const rules = await listActiveScheduleRulesForCourtDate(input, client);
  return generateSlotsFromScheduleRules(rules, input.localDate);
}

export function generateSlotsFromScheduleRules(
  rules: ScheduleRuleForSlots[],
  localDate: string
): GeneratedSlot[] {
  const slots = rules
    .filter((rule) => rule.isActive)
    .flatMap((rule) => generateSlotsFromScheduleRule(rule, localDate))
    .sort(compareSlots);

  assertNoOverlappingSlots(slots);

  return slots;
}

export function generateSlotsFromScheduleRule(
  rule: ScheduleRuleForSlots,
  localDate: string
): GeneratedSlot[] {
  const startMinutes = timeDateToMinutes(rule.startLocalTime);
  const endMinutes = timeDateToMinutes(rule.endLocalTime);

  assertValidTimeRange(startMinutes, endMinutes);

  if (!Number.isInteger(rule.slotMinutes) || rule.slotMinutes <= 0) {
    throw new Error("La duración del turno debe ser positiva.");
  }

  const slots: GeneratedSlot[] = [];

  for (
    let slotStart = startMinutes;
    slotStart + rule.slotMinutes <= endMinutes;
    slotStart += rule.slotMinutes
  ) {
    const slotEnd = slotStart + rule.slotMinutes;

    slots.push({
      courtId: rule.courtId,
      scheduleRuleId: rule.id,
      localDate,
      startLocalTime: dateToLocalTimeString(localDateAndMinutesToUtc(localDate, slotStart)),
      endLocalTime: dateToLocalTimeString(localDateAndMinutesToUtc(localDate, slotEnd)),
      startMinutes: slotStart,
      endMinutes: slotEnd,
      startAtUtc: localDateAndMinutesToUtc(localDate, slotStart),
      endAtUtc: localDateAndMinutesToUtc(localDate, slotEnd)
    });
  }

  return slots;
}

export function compareSlots(left: GeneratedSlot, right: GeneratedSlot): number {
  return (
    left.startMinutes - right.startMinutes ||
    left.endMinutes - right.endMinutes ||
    left.courtId.localeCompare(right.courtId)
  );
}

export function assertNoOverlappingSlots(slots: GeneratedSlot[]) {
  const slotsByCourt = new Map<string, GeneratedSlot[]>();

  for (const slot of slots) {
    const courtSlots = slotsByCourt.get(slot.courtId) ?? [];
    courtSlots.push(slot);
    slotsByCourt.set(slot.courtId, courtSlots);
  }

  for (const courtSlots of slotsByCourt.values()) {
    const sortedSlots = [...courtSlots].sort(compareSlots);

    for (let index = 1; index < sortedSlots.length; index += 1) {
      const previous = sortedSlots[index - 1];
      const current = sortedSlots[index];

      if (previous.endMinutes > current.startMinutes) {
        throw new Error("Los horarios activos generan turnos superpuestos.");
      }
    }
  }
}

export async function listAdminScheduleRules(
  input: {
    actor: Pick<UserProfileWithVenue, "role" | "venueId">;
    venueId?: string | null;
    courtId?: string | null;
  },
  client: ScheduleClient = prisma
) {
  const venueId = resolveAdminVenueId(input.actor, input.venueId);

  return client.scheduleRule.findMany({
    where: {
      ...(input.courtId ? { courtId: input.courtId } : {}),
      court: {
        ...(venueId ? { venueId } : {})
      }
    },
    include: {
      court: {
        select: {
          id: true,
          name: true,
          venueId: true
        }
      }
    },
    orderBy: [
      { court: { name: "asc" } },
      { dayOfWeek: "asc" },
      { startLocalTime: "asc" }
    ]
  });
}

export async function upsertScheduleRuleForAdmin(
  input: ScheduleRuleInput & {
    actor: Pick<UserProfileWithVenue, "id" | "role" | "venueId">;
  },
  client: TransactionRunner = prisma
): Promise<ScheduleRule> {
  return client.$transaction(async (tx) => {
    const court = await tx.court.findUnique({
      where: { id: input.courtId },
      select: { id: true, venueId: true }
    });

    if (!court) {
      throw new Error("No encontramos la cancha del horario.");
    }

    if (!canManageVenue(input.actor, court.venueId)) {
      throw new Error("No tienes permiso para administrar horarios de esta cancha.");
    }

    const startMinutes = timeDateToMinutes(timeStringToDateCompat(input.startLocalTime));
    const endMinutes = timeDateToMinutes(timeStringToDateCompat(input.endLocalTime));
    assertValidTimeRange(startMinutes, endMinutes);

    await assertScheduleRuleDoesNotOverlap(
      {
        courtId: input.courtId,
        scheduleRuleId: input.scheduleRuleId,
        dayOfWeek: input.dayOfWeek,
        startMinutes,
        endMinutes,
        isActive: input.isActive
      },
      tx
    );

    const beforeRule = input.scheduleRuleId
      ? await tx.scheduleRule.findUnique({ where: { id: input.scheduleRuleId } })
      : null;

    if (input.scheduleRuleId && (!beforeRule || beforeRule.courtId !== input.courtId)) {
      throw new Error("No encontramos ese horario para la cancha indicada.");
    }

    const scheduleRule = input.scheduleRuleId
      ? await tx.scheduleRule.update({
          where: { id: input.scheduleRuleId },
          data: scheduleRuleData(input)
        })
      : await tx.scheduleRule.create({
          data: {
            courtId: input.courtId,
            ...scheduleRuleData(input)
          }
        });

    await appendAuditRecord(
      {
        entityType: AuditEntityType.SCHEDULE_RULE,
        entityId: scheduleRule.id,
        action: input.scheduleRuleId ? "SCHEDULE_RULE_UPDATED" : "SCHEDULE_RULE_CREATED",
        actorUserId: input.actor.id,
        actorRole: input.actor.role,
        source: AuditSource.USER,
        beforeState: beforeRule ? scheduleRuleAuditState(beforeRule) : null,
        afterState: scheduleRuleAuditState(scheduleRule),
        courtId: scheduleRule.courtId,
        scheduleRuleId: scheduleRule.id
      },
      tx
    );

    return scheduleRule;
  });
}

async function assertScheduleRuleDoesNotOverlap(
  input: {
    courtId: string;
    scheduleRuleId?: string;
    dayOfWeek: number;
    startMinutes: number;
    endMinutes: number;
    isActive: boolean;
  },
  client: ScheduleClient
) {
  if (!input.isActive) {
    return;
  }

  const rules = await client.scheduleRule.findMany({
    where: {
      courtId: input.courtId,
      dayOfWeek: input.dayOfWeek,
      isActive: true,
      ...(input.scheduleRuleId ? { id: { not: input.scheduleRuleId } } : {})
    }
  });

  const overlaps = rules.some((rule) => {
    const startMinutes = timeDateToMinutes(rule.startLocalTime);
    const endMinutes = timeDateToMinutes(rule.endLocalTime);
    return input.startMinutes < endMinutes && input.endMinutes > startMinutes;
  });

  if (overlaps) {
    throw new Error("El horario se superpone con otra regla activa.");
  }
}

function scheduleRuleData(input: ScheduleRuleInput) {
  return {
    dayOfWeek: input.dayOfWeek,
    startLocalTime: timeStringToDateCompat(input.startLocalTime),
    endLocalTime: timeStringToDateCompat(input.endLocalTime),
    slotMinutes: input.slotMinutes,
    cancellationCutoffMinutes: input.cancellationCutoffMinutes,
    isActive: input.isActive
  };
}

function resolveAdminVenueId(
  actor: Pick<UserProfileWithVenue, "role" | "venueId">,
  requestedVenueId?: string | null
): string | null {
  if (actor.role === "WALLY_ADMIN") {
    return requestedVenueId ?? null;
  }

  if (actor.role === "VENUE_ADMIN" && actor.venueId) {
    if (requestedVenueId && requestedVenueId !== actor.venueId) {
      throw new Error("No tienes permiso para administrar ese venue.");
    }

    return actor.venueId;
  }

  throw new Error("No tienes permiso para administrar horarios.");
}

function scheduleRuleAuditState(rule: ScheduleRule): Prisma.InputJsonObject {
  return {
    id: rule.id,
    courtId: rule.courtId,
    dayOfWeek: rule.dayOfWeek,
    startLocalTime: rule.startLocalTime.toISOString().slice(11, 19),
    endLocalTime: rule.endLocalTime.toISOString().slice(11, 19),
    slotMinutes: rule.slotMinutes,
    cancellationCutoffMinutes: rule.cancellationCutoffMinutes,
    isActive: rule.isActive
  };
}

function timeStringToDateCompat(time: string) {
  const [hour, minute, second = "0"] = time.split(":");
  return new Date(Date.UTC(1970, 0, 1, Number(hour), Number(minute), Number(second)));
}
