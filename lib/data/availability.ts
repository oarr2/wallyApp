import {
  AuditEntityType,
  AuditSource,
  AvailabilityOverrideType,
  type AvailabilityOverride
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/data/prisma";
import { canManageVenue } from "@/lib/auth/authorization";
import { appendAuditRecord } from "@/lib/data/audit";
import {
  assertNoOverlappingSlots,
  compareSlots,
  type GeneratedSlot
} from "@/lib/data/schedules";
import type { UserProfileWithVenue } from "@/lib/data/user-profiles";
import {
  assertValidTimeRange,
  dateToLocalTimeString,
  localDateAndMinutesToUtc,
  localDateStringToDate,
  timeDateToMinutes
} from "@/lib/time/la-paz";
import type { AvailabilityOverrideInput } from "@/lib/validation/admin";

export type AvailabilityOverrideForSlots = Pick<
  AvailabilityOverride,
  "id" | "courtId" | "localDate" | "startLocalTime" | "endLocalTime" | "type"
>;

export type AvailabilityClient = Pick<
  Prisma.TransactionClient,
  "auditRecord" | "availabilityOverride" | "court"
>;

type TransactionRunner = Pick<typeof prisma, "$transaction">;

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

export async function listAdminAvailabilityOverrides(
  input: {
    actor: Pick<UserProfileWithVenue, "role" | "venueId">;
    venueId?: string | null;
    courtId?: string | null;
    localDate?: string | null;
  },
  client: AvailabilityClient = prisma
) {
  const venueId = resolveAdminVenueId(input.actor, input.venueId);

  return client.availabilityOverride.findMany({
    where: {
      ...(input.courtId ? { courtId: input.courtId } : {}),
      ...(input.localDate ? { localDate: localDateStringToDate(input.localDate) } : {}),
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
      },
      createdByUser: {
        select: {
          id: true,
          displayName: true
        }
      }
    },
    orderBy: [{ localDate: "desc" }, { startLocalTime: "asc" }]
  });
}

export async function upsertAvailabilityOverrideForAdmin(
  input: AvailabilityOverrideInput & {
    actor: Pick<UserProfileWithVenue, "id" | "role" | "venueId">;
  },
  client: TransactionRunner = prisma
): Promise<AvailabilityOverride> {
  return client.$transaction(async (tx) => {
    const court = await tx.court.findUnique({
      where: { id: input.courtId },
      select: { id: true, venueId: true }
    });

    if (!court) {
      throw new Error("No encontramos la cancha de la disponibilidad.");
    }

    if (!canManageVenue(input.actor, court.venueId)) {
      throw new Error("No tienes permiso para administrar disponibilidad de esta cancha.");
    }

    const beforeOverride = input.availabilityOverrideId
      ? await tx.availabilityOverride.findUnique({
          where: { id: input.availabilityOverrideId }
        })
      : null;

    if (
      input.availabilityOverrideId &&
      (!beforeOverride || beforeOverride.courtId !== input.courtId)
    ) {
      throw new Error("No encontramos ese ajuste para la cancha indicada.");
    }

    const data = availabilityOverrideData(input, input.actor.id);
    const override = input.availabilityOverrideId
      ? await tx.availabilityOverride.update({
          where: { id: input.availabilityOverrideId },
          data
        })
      : await tx.availabilityOverride.create({
          data: {
            courtId: input.courtId,
            ...data
          }
        });

    await appendAuditRecord(
      {
        entityType: AuditEntityType.AVAILABILITY_OVERRIDE,
        entityId: override.id,
        action: input.availabilityOverrideId
          ? "AVAILABILITY_OVERRIDE_UPDATED"
          : "AVAILABILITY_OVERRIDE_CREATED",
        actorUserId: input.actor.id,
        actorRole: input.actor.role,
        source: AuditSource.USER,
        beforeState: beforeOverride ? availabilityOverrideAuditState(beforeOverride) : null,
        afterState: availabilityOverrideAuditState(override),
        reason: input.reason ?? null,
        courtId: override.courtId,
        availabilityOverrideId: override.id
      },
      tx
    );

    return override;
  });
}

function availabilityOverrideData(input: AvailabilityOverrideInput, actorId: string) {
  const wholeDay = input.type === AvailabilityOverrideType.CLOSED_DAY;

  if (!wholeDay) {
    const startMinutes = timeDateToMinutes(timeStringToDateCompat(input.startLocalTime ?? ""));
    const endMinutes = timeDateToMinutes(timeStringToDateCompat(input.endLocalTime ?? ""));
    assertValidTimeRange(startMinutes, endMinutes);
  }

  return {
    localDate: localDateStringToDate(input.localDate),
    type: input.type,
    startLocalTime: wholeDay ? null : timeStringToDateCompat(input.startLocalTime ?? ""),
    endLocalTime: wholeDay ? null : timeStringToDateCompat(input.endLocalTime ?? ""),
    reason: input.reason ?? null,
    createdByUserId: actorId
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

  throw new Error("No tienes permiso para administrar disponibilidad.");
}

function availabilityOverrideAuditState(
  override: AvailabilityOverride
): Prisma.InputJsonObject {
  return {
    id: override.id,
    courtId: override.courtId,
    localDate: override.localDate.toISOString().slice(0, 10),
    type: override.type,
    startLocalTime: override.startLocalTime?.toISOString().slice(11, 19) ?? null,
    endLocalTime: override.endLocalTime?.toISOString().slice(11, 19) ?? null,
    reason: override.reason
  };
}

function timeStringToDateCompat(time: string) {
  const [hour, minute, second = "0"] = time.split(":");
  return new Date(Date.UTC(1970, 0, 1, Number(hour), Number(minute), Number(second)));
}
