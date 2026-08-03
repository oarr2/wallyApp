import {
  AuditEntityType,
  AuditSource,
  PaymentStatus,
  ReservationStatus,
  type Prisma,
  type Reservation,
  type UserProfile
} from "@prisma/client";
import { canManageVenue } from "@/lib/auth/authorization";
import { applyAvailabilityOverrides } from "@/lib/data/availability";
import { appendAuditRecord } from "@/lib/data/audit";
import prisma from "@/lib/data/prisma";
import { generateSlotsForCourtDate, type GeneratedSlot } from "@/lib/data/schedules";
import {
  assertValidTimeRange,
  localDateStringToDate,
  timeDateToMinutes,
  timeStringToDate
} from "@/lib/time/la-paz";
import type {
  AvailableSlotsInput,
  ReservationCancelInput,
  ReservationCreateInput
} from "@/lib/validation/reservations";

export type ReservationClient = Pick<
  Prisma.TransactionClient,
  | "availabilityOverride"
  | "court"
  | "courtSport"
  | "reservation"
  | "scheduleRule"
  | "auditRecord"
>;

type TransactionRunner = Pick<typeof prisma, "$transaction">;

export type AvailableSlot = GeneratedSlot & {
  isAvailable: boolean;
};

export type ReservationWithDetails = Reservation & {
  court: { id: string; name: string; venueId: string };
  sport: { id: string; name: string; code: string };
  player: { id: string; displayName: string };
};

export type ReservableCourtOption = {
  id: string;
  name: string;
  description: string | null;
  sportId: string;
  sportName: string;
  sportCode: string;
};

const activeReservationStatuses = [ReservationStatus.CONFIRMED];

export async function listReservableCourtOptions(
  client: ReservationClient = prisma
): Promise<ReservableCourtOption[]> {
  const courts = await client.court.findMany({
    where: {
      isActive: true,
      courtSports: {
        some: {
          isActive: true,
          sport: { isActive: true }
        }
      }
    },
    include: {
      courtSports: {
        where: {
          isActive: true,
          sport: { isActive: true }
        },
        include: { sport: true },
        orderBy: { sport: { name: "asc" } }
      }
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
  });

  return courts.flatMap((court) =>
    court.courtSports.map((courtSport) => ({
      id: court.id,
      name: court.name,
      description: court.description,
      sportId: courtSport.sport.id,
      sportName: courtSport.sport.name,
      sportCode: courtSport.sport.code
    }))
  );
}

export async function listAvailableSlots(
  input: AvailableSlotsInput,
  client: ReservationClient = prisma
): Promise<AvailableSlot[]> {
  if (!input.courtId || !input.sportId) {
    return [];
  }

  const courtSport = await client.courtSport.findFirst({
    where: {
      courtId: input.courtId,
      sportId: input.sportId,
      isActive: true,
      court: { isActive: true },
      sport: { isActive: true }
    },
    select: { courtId: true }
  });

  if (!courtSport) {
    return [];
  }

  const localDate = localDateStringToDate(input.localDate);
  const [scheduleSlots, overrides, reservations] = await Promise.all([
    generateSlotsForCourtDate(
      { courtId: input.courtId, localDate: input.localDate },
      client
    ),
    client.availabilityOverride.findMany({
      where: {
        courtId: input.courtId,
        localDate
      }
    }),
    client.reservation.findMany({
      where: {
        courtId: input.courtId,
        localDate,
        status: { in: activeReservationStatuses }
      },
      select: {
        startAtUtc: true,
        endAtUtc: true
      }
    })
  ]);

  return applyAvailabilityOverrides(scheduleSlots, overrides)
    .filter(
      (slot) =>
        !reservations.some(
          (reservation) =>
            reservation.startAtUtc < slot.endAtUtc &&
            reservation.endAtUtc > slot.startAtUtc
        )
    )
    .map((slot) => ({ ...slot, isAvailable: true }));
}

export async function createReservation(
  input: ReservationCreateInput & { actor: Pick<UserProfile, "id" | "role"> },
  client: TransactionRunner = prisma
): Promise<Reservation> {
  return client.$transaction(async (tx) => {
    const startMinutes = timeDateToMinutes(timeStringToDate(input.startLocalTime));
    const endMinutes = timeDateToMinutes(timeStringToDate(input.endLocalTime));
    assertValidTimeRange(startMinutes, endMinutes);

    const availableSlots = await listAvailableSlots(input, tx);
    const selectedSlot = availableSlots.find(
      (slot) =>
        slot.startLocalTime === normalizeTime(input.startLocalTime) &&
        slot.endLocalTime === normalizeTime(input.endLocalTime)
    );

    if (!selectedSlot) {
      throw new Error("Ese horario ya no está disponible. Elige otro turno.");
    }

    const reservation = await tx.reservation.create({
      data: {
        playerId: input.actor.id,
        courtId: input.courtId,
        sportId: input.sportId,
        localDate: localDateStringToDate(input.localDate),
        startAtUtc: selectedSlot.startAtUtc,
        endAtUtc: selectedSlot.endAtUtc,
        startLocalTime: timeStringToDate(input.startLocalTime),
        endLocalTime: timeStringToDate(input.endLocalTime),
        status: ReservationStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING
      }
    });

    await appendAuditRecord(
      {
        entityType: AuditEntityType.RESERVATION,
        entityId: reservation.id,
        action: "RESERVATION_CREATED",
        actorUserId: input.actor.id,
        actorRole: input.actor.role,
        source: AuditSource.USER,
        afterState: reservationAuditState(reservation),
        reservationId: reservation.id,
        courtId: reservation.courtId,
        sportId: reservation.sportId
      },
      tx
    );

    return reservation;
  });
}

export async function listPlayerUpcomingReservations(
  input: { actor: Pick<UserProfile, "id">; now?: Date },
  client: ReservationClient = prisma
): Promise<ReservationWithDetails[]> {
  return client.reservation.findMany({
    where: {
      playerId: input.actor.id,
      status: ReservationStatus.CONFIRMED,
      startAtUtc: { gte: input.now ?? new Date() }
    },
    include: reservationDetailsInclude,
    orderBy: { startAtUtc: "asc" }
  });
}

export async function getReservationForActor(
  input: {
    reservationId: string;
    actor: Pick<UserProfile, "id" | "role" | "venueId">;
  },
  client: ReservationClient = prisma
): Promise<ReservationWithDetails | null> {
  const reservation = await client.reservation.findUnique({
    where: { id: input.reservationId },
    include: reservationDetailsInclude
  });

  if (!reservation) {
    return null;
  }

  if (
    reservation.playerId !== input.actor.id &&
    !canManageVenue(input.actor, reservation.court.venueId)
  ) {
    return null;
  }

  return reservation;
}

export async function cancelReservation(
  input: ReservationCancelInput & { actor: Pick<UserProfile, "id" | "role"> },
  client: TransactionRunner = prisma
): Promise<Reservation> {
  return client.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: input.reservationId },
      include: {
        court: true
      }
    });

    if (!reservation || reservation.playerId !== input.actor.id) {
      throw new Error("No encontramos esa reserva en tu cuenta.");
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new Error("Esta reserva ya no está activa.");
    }

    const scheduleRule = await tx.scheduleRule.findFirst({
      where: {
        courtId: reservation.courtId,
        dayOfWeek: reservation.localDate.getUTCDay(),
        isActive: true,
        startLocalTime: { lte: reservation.startLocalTime },
        endLocalTime: { gte: reservation.endLocalTime }
      },
      orderBy: { cancellationCutoffMinutes: "desc" }
    });
    const cutoffMinutes = scheduleRule?.cancellationCutoffMinutes ?? 120;
    const latestCancellationAt = new Date(
      reservation.startAtUtc.getTime() - cutoffMinutes * 60_000
    );

    if (new Date() > latestCancellationAt) {
      throw new Error(
        `La cancelación debe realizarse al menos ${cutoffMinutes} minutos antes.`
      );
    }

    const beforeState = reservationAuditState(reservation);
    const updated = await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: ReservationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledByUserId: input.actor.id,
        cancellationReason: input.reason ?? "Cancelada por el jugador"
      }
    });

    await appendAuditRecord(
      {
        entityType: AuditEntityType.RESERVATION,
        entityId: updated.id,
        action: "RESERVATION_CANCELLED_BY_PLAYER",
        actorUserId: input.actor.id,
        actorRole: input.actor.role,
        source: AuditSource.USER,
        beforeState,
        afterState: reservationAuditState(updated),
        reason: updated.cancellationReason,
        reservationId: updated.id,
        courtId: updated.courtId,
        sportId: updated.sportId
      },
      tx
    );

    return updated;
  });
}

const reservationDetailsInclude = {
  court: {
    select: {
      id: true,
      name: true,
      venueId: true
    }
  },
  sport: {
    select: {
      id: true,
      name: true,
      code: true
    }
  },
  player: {
    select: {
      id: true,
      displayName: true
    }
  }
} satisfies Prisma.ReservationInclude;

function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

function reservationAuditState(reservation: Reservation): Prisma.InputJsonObject {
  return {
    id: reservation.id,
    playerId: reservation.playerId,
    courtId: reservation.courtId,
    sportId: reservation.sportId,
    startAtUtc: reservation.startAtUtc.toISOString(),
    endAtUtc: reservation.endAtUtc.toISOString(),
    status: reservation.status,
    paymentStatus: reservation.paymentStatus
  };
}
