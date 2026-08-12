import {
  AuditEntityType,
  AuditSource,
  ReservationStatus,
  type Prisma,
  type Reservation,
  type UserProfile
} from "@prisma/client";
import { canManageVenue } from "@/lib/auth/authorization";
import { appendAuditRecord } from "@/lib/data/audit";
import prisma from "@/lib/data/prisma";

export type AdminReservationClient = Pick<Prisma.TransactionClient, "auditRecord"> & {
  reservation: Prisma.TransactionClient["reservation"];
};

type TransactionRunner = Pick<typeof prisma, "$transaction">;

export type AdminReservationFilters = {
  venueId?: string | null;
  courtId?: string | null;
  status?: ReservationStatus | "TODAS" | null;
  query?: string | null;
};

const adminReservationInclude = {
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
      displayName: true,
      phone: true
    }
  },
  payments: {
    orderBy: { createdAt: "desc" }
  },
  auditRecords: {
    orderBy: { createdAt: "desc" },
    take: 20
  }
} satisfies Prisma.ReservationInclude;

export type AdminReservationWithDetails = Prisma.ReservationGetPayload<{
  include: typeof adminReservationInclude;
}>;

export async function listAdminReservations(
  input: {
    actor: Pick<UserProfile, "role" | "venueId">;
    filters?: AdminReservationFilters;
  },
  client: AdminReservationClient = prisma
): Promise<AdminReservationWithDetails[]> {
  const venueId = resolveAdminVenueId(input.actor, input.filters?.venueId);
  const query = input.filters?.query?.trim();

  return client.reservation.findMany({
    where: {
      ...(input.filters?.courtId ? { courtId: input.filters.courtId } : {}),
      ...(input.filters?.status && input.filters.status !== "TODAS"
        ? { status: input.filters.status }
        : {}),
      court: {
        ...(venueId ? { venueId } : {})
      },
      ...(query
        ? {
            OR: [
              { player: { displayName: { contains: query, mode: "insensitive" } } },
              { court: { name: { contains: query, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: adminReservationInclude,
    orderBy: { startAtUtc: "desc" },
    take: 100
  });
}

export async function getAdminReservationDetail(
  input: {
    reservationId: string;
    actor: Pick<UserProfile, "role" | "venueId">;
  },
  client: AdminReservationClient = prisma
): Promise<AdminReservationWithDetails | null> {
  const reservation = await client.reservation.findUnique({
    where: { id: input.reservationId },
    include: adminReservationInclude
  });

  if (!reservation) {
    return null;
  }

  if (!canManageVenue(input.actor, reservation.court.venueId)) {
    return null;
  }

  return reservation;
}

export async function adminCancelReservation(
  input: {
    reservationId: string;
    reason: string;
    actor: Pick<UserProfile, "id" | "role" | "venueId">;
  },
  client: TransactionRunner = prisma
): Promise<Reservation> {
  const reason = input.reason.trim();

  if (!reason) {
    throw new Error("Ingresa un motivo de auditoría para cancelar la reserva.");
  }

  return client.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: input.reservationId },
      include: { court: { select: { venueId: true } } }
    });

    if (!reservation) {
      throw new Error("No encontramos la reserva.");
    }

    if (!canManageVenue(input.actor, reservation.court.venueId)) {
      throw new Error("No tienes permiso para cancelar esta reserva.");
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new Error("Esta reserva ya no está activa.");
    }

    const beforeState = reservationAuditState(reservation);
    const updated = await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: ReservationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledByUserId: input.actor.id,
        cancellationReason: reason
      }
    });

    await appendAuditRecord(
      {
        entityType: AuditEntityType.RESERVATION,
        entityId: updated.id,
        action: "RESERVATION_CANCELLED_BY_ADMIN",
        actorUserId: input.actor.id,
        actorRole: input.actor.role,
        source: AuditSource.USER,
        beforeState,
        afterState: reservationAuditState(updated),
        reason,
        reservationId: updated.id,
        courtId: updated.courtId,
        sportId: updated.sportId
      },
      tx
    );

    return updated;
  });
}

function resolveAdminVenueId(
  actor: Pick<UserProfile, "role" | "venueId">,
  requestedVenueId?: string | null
): string | null {
  if (actor.role === "WALLY_ADMIN") {
    return requestedVenueId ?? null;
  }

  if (actor.role === "VENUE_ADMIN" && actor.venueId) {
    if (requestedVenueId && requestedVenueId !== actor.venueId) {
      throw new Error("No tienes permiso para revisar reservas de ese venue.");
    }

    return actor.venueId;
  }

  throw new Error("No tienes permiso para administrar reservas.");
}

function reservationAuditState(
  reservation: Pick<
    Reservation,
    | "id"
    | "playerId"
    | "courtId"
    | "sportId"
    | "startAtUtc"
    | "endAtUtc"
    | "status"
    | "paymentStatus"
    | "cancelledAt"
    | "cancelledByUserId"
    | "cancellationReason"
  >
): Prisma.InputJsonObject {
  return {
    id: reservation.id,
    playerId: reservation.playerId,
    courtId: reservation.courtId,
    sportId: reservation.sportId,
    startAtUtc: reservation.startAtUtc.toISOString(),
    endAtUtc: reservation.endAtUtc.toISOString(),
    status: reservation.status,
    paymentStatus: reservation.paymentStatus,
    cancelledAt: reservation.cancelledAt?.toISOString() ?? null,
    cancelledByUserId: reservation.cancelledByUserId,
    cancellationReason: reservation.cancellationReason
  };
}
