import { AvailabilityOverrideType, type AvailabilityOverride } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/data/prisma";
import {
  assertNoOverlappingSlots,
  compareSlots,
  type GeneratedSlot
} from "@/lib/data/schedules";
import {
  assertValidTimeRange,
  dateToLocalTimeString,
  localDateAndMinutesToUtc,
  timeDateToMinutes
} from "@/lib/time/la-paz";

export type AvailabilityOverrideForSlots = Pick<
  AvailabilityOverride,
  "id" | "courtId" | "localDate" | "startLocalTime" | "endLocalTime" | "type"
>;

export type AvailabilityClient = Pick<
  Prisma.TransactionClient,
  "availabilityOverride"
>;

export async function listAvailabilityOverridesForCourtDate(
  input: { courtId: string; localDate: Date },
  client: AvailabilityClient = prisma
): Promise<AvailabilityOverride[]> {
  return client.availabilityOverride.findMany({
    where: {
      courtId: input.courtId,
      localDate: input.localDate
    },
    orderBy: [{ type: "asc" }, { startLocalTime: "asc" }]
  });
}

export function applyAvailabilityOverrides(
  slots: GeneratedSlot[],
  overrides: AvailabilityOverrideForSlots[]
): GeneratedSlot[] {
  if (overrides.some((override) => override.type === AvailabilityOverrideType.CLOSED_DAY)) {
    return [];
  }

  const openedSlots = overrides
    .filter((override) => override.type === AvailabilityOverrideType.OPEN_EXTRA)
    .flatMap((override) => slotsFromOpenExtraOverride(override));
  const blockedOverrides = overrides.filter(
    (override) => override.type === AvailabilityOverrideType.BLOCKED
  );
  const mergedSlots = dedupeSlots([...slots, ...openedSlots]);
  const availableSlots = mergedSlots
    .filter(
      (slot) =>
        !blockedOverrides.some((override) => overrideOverlapsSlot(override, slot))
    )
    .sort(compareSlots);

  assertNoOverlappingSlots(availableSlots);

  return availableSlots;
}

function slotsFromOpenExtraOverride(
  override: AvailabilityOverrideForSlots
): GeneratedSlot[] {
  const range = getOverrideRange(override);
  const slotMinutes =
    range.endMinutes - range.startMinutes <= 60 ? range.endMinutes - range.startMinutes : 60;
  const slots: GeneratedSlot[] = [];

  for (
    let slotStart = range.startMinutes;
    slotStart + slotMinutes <= range.endMinutes;
    slotStart += slotMinutes
  ) {
    const slotEnd = slotStart + slotMinutes;

    slots.push({
      courtId: override.courtId,
      scheduleRuleId: null,
      localDate: range.localDate,
      startLocalTime: dateToLocalTimeString(
        localDateAndMinutesToUtc(range.localDate, slotStart)
      ),
      endLocalTime: dateToLocalTimeString(
        localDateAndMinutesToUtc(range.localDate, slotEnd)
      ),
      startMinutes: slotStart,
      endMinutes: slotEnd,
      startAtUtc: localDateAndMinutesToUtc(range.localDate, slotStart),
      endAtUtc: localDateAndMinutesToUtc(range.localDate, slotEnd)
    });
  }

  return slots;
}

function overrideOverlapsSlot(
  override: AvailabilityOverrideForSlots,
  slot: GeneratedSlot
): boolean {
  const range = getOverrideRange(override);
  return range.startMinutes < slot.endMinutes && range.endMinutes > slot.startMinutes;
}

function getOverrideRange(override: AvailabilityOverrideForSlots): {
  localDate: string;
  startMinutes: number;
  endMinutes: number;
} {
  if (!override.startLocalTime || !override.endLocalTime) {
    throw new Error("El ajuste de disponibilidad requiere rango horario.");
  }

  const startMinutes = timeDateToMinutes(override.startLocalTime);
  const endMinutes = timeDateToMinutes(override.endLocalTime);
  assertValidTimeRange(startMinutes, endMinutes);

  return {
    localDate: override.localDate.toISOString().slice(0, 10),
    startMinutes,
    endMinutes
  };
}

function dedupeSlots(slots: GeneratedSlot[]): GeneratedSlot[] {
  const byKey = new Map<string, GeneratedSlot>();

  for (const slot of slots) {
    byKey.set(`${slot.courtId}:${slot.startMinutes}:${slot.endMinutes}`, slot);
  }

  return [...byKey.values()].sort(compareSlots);
}
