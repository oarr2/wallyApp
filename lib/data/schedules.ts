import type { Prisma, ScheduleRule } from "@prisma/client";
import prisma from "@/lib/data/prisma";
import {
  assertValidTimeRange,
  dateToLocalTimeString,
  getLaPazDayOfWeek,
  localDateAndMinutesToUtc,
  timeDateToMinutes
} from "@/lib/time/la-paz";

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

export type ScheduleClient = Pick<Prisma.TransactionClient, "scheduleRule">;

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
