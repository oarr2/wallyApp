import {
  AuditEntityType,
  AuditSource,
  PaymentEventStatus,
  PaymentSource,
  PaymentStatus,
  type Payment,
  type Prisma,
  type Reservation,
  type UserProfile
} from "@prisma/client";
import { canManageVenue } from "@/lib/auth/authorization";
import { canTransitionPaymentStatus } from "@/components/payments/payment-status";
import { appendAuditRecord } from "@/lib/data/audit";
import prisma from "@/lib/data/prisma";
import type {
  AdminPaymentStatusUpdateInput,
  PaymentEventInput
} from "@/lib/validation/payments";

export type PaymentClient = Pick<
  Prisma.TransactionClient,
  "auditRecord" | "payment" | "paymentEvent" | "reservation"
>;

type TransactionRunner = Pick<typeof prisma, "$transaction">;

export type PaymentWithReservation = Payment & {
  reservation: {
    id: string;
    playerId: string;
    paymentStatus: PaymentStatus;
    court: { id: string; name: string; venueId: string };
    player: { id: string; displayName: string };
  };
};

export async function listPaymentHistoryForReservation(
  input: {
    reservationId: string;
    actor: Pick<UserProfile, "id" | "role" | "venueId">;
  },
  client: PaymentClient = prisma
): Promise<Payment[]> {
  const reservation = await client.reservation.findUnique({
    where: { id: input.reservationId },
    include: {
      court: { select: { venueId: true } }
    }
  });

  if (!reservation) {
    return [];
  }

  if (
    reservation.playerId !== input.actor.id &&
    !canManageVenue(input.actor, reservation.court.venueId)
  ) {
    throw new Error("No tienes permiso para ver los pagos de esta reserva.");
  }

  return client.payment.findMany({
    where: { reservationId: input.reservationId },
    orderBy: { createdAt: "desc" }
  });
}

export async function listAdminPaymentHistory(
  input: {
    actor: Pick<UserProfile, "role" | "venueId">;
    venueId?: string | null;
  },
  client: PaymentClient = prisma
): Promise<PaymentWithReservation[]> {
  const venueFilter = resolveVenueFilter(input.actor, input.venueId);

  return client.payment.findMany({
    where: venueFilter
      ? {
          reservation: {
            court: { venueId: venueFilter }
          }
        }
      : undefined,
    include: {
      reservation: {
        select: {
          id: true,
          playerId: true,
          paymentStatus: true,
          court: {
            select: {
              id: true,
              name: true,
              venueId: true
            }
          },
          player: {
            select: {
              id: true,
              displayName: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updatePaymentStatus(
  input: AdminPaymentStatusUpdateInput & {
    actor: Pick<UserProfile, "id" | "role" | "venueId">;
  },
  client: TransactionRunner = prisma
): Promise<{ payment: Payment; reservation: Reservation }> {
  return client.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: input.reservationId },
      include: { court: { select: { venueId: true } } }
    });

    if (!reservation) {
      throw new Error("No encontramos la reserva.");
    }

    if (!canManageVenue(input.actor, reservation.court.venueId)) {
      throw new Error("No tienes permiso para ajustar el pago de esta reserva.");
    }

    assertPaymentTransition(reservation.paymentStatus, input.status);

    const beforeState = reservationPaymentAuditState(reservation);
    const payment = await tx.payment.create({
      data: {
        reservationId: reservation.id,
        status: input.status,
        amount: input.amount,
        currency: input.currency,
        source: PaymentSource.MANUAL,
        reason: input.reason,
        createdByUserId: input.actor.id
      }
    });
    const updatedReservation = await tx.reservation.update({
      where: { id: reservation.id },
      data: { paymentStatus: input.status }
    });

    await appendAuditRecord(
      {
        entityType: AuditEntityType.PAYMENT,
        entityId: payment.id,
        action: "PAYMENT_STATUS_UPDATED",
        actorUserId: input.actor.id,
        actorRole: input.actor.role,
        source: AuditSource.USER,
        beforeState,
        afterState: reservationPaymentAuditState(updatedReservation, payment.id),
        reason: input.reason,
        reservationId: reservation.id,
        paymentId: payment.id,
        courtId: reservation.courtId,
        sportId: reservation.sportId
      },
      tx
    );

    return {
      payment,
      reservation: updatedReservation
    };
  });
}

export async function processPaymentEvent(
  input: PaymentEventInput,
  client: TransactionRunner = prisma
): Promise<{ duplicate: boolean; payment: Payment | null; reservation: Reservation | null }> {
  return client.$transaction(async (tx) => {
    const existingEvent = await tx.paymentEvent.findUnique({
      where: {
        source_sourceEventId: {
          source: input.source,
          sourceEventId: input.sourceEventId
        }
      }
    });

    if (existingEvent) {
      return { duplicate: true, payment: null, reservation: null };
    }

    const reservation = await tx.reservation.findUnique({
      where: { id: input.reservationId }
    });

    if (!reservation) {
      await tx.paymentEvent.create({
        data: {
          source: input.source,
          sourceEventId: input.sourceEventId,
          reservationId: null,
          status: PaymentEventStatus.FAILED,
          payloadSummary: paymentEventSummary(input)
        }
      });
      throw new Error("No encontramos la reserva del evento.");
    }

    assertPaymentTransition(reservation.paymentStatus, input.status);

    const event = await tx.paymentEvent.create({
      data: {
        source: input.source,
        sourceEventId: input.sourceEventId,
        reservationId: reservation.id,
        status: PaymentEventStatus.RECEIVED,
        payloadSummary: paymentEventSummary(input)
      }
    });
    const beforeState = reservationPaymentAuditState(reservation);
    const payment = await tx.payment.create({
      data: {
        reservationId: reservation.id,
        status: input.status,
        currency: "BOB",
        source: PaymentSource.EVENT,
        sourceReference: `${input.source}:${input.sourceEventId}`,
        reason: input.reason ?? "Evento de pago recibido"
      }
    });
    const updatedReservation = await tx.reservation.update({
      where: { id: reservation.id },
      data: { paymentStatus: input.status }
    });

    await tx.paymentEvent.update({
      where: { id: event.id },
      data: {
        status: PaymentEventStatus.PROCESSED,
        processedAt: input.occurredAt ? new Date(input.occurredAt) : new Date()
      }
    });

    await appendAuditRecord(
      {
        entityType: AuditEntityType.PAYMENT,
        entityId: payment.id,
        action: "PAYMENT_EVENT_PROCESSED",
        actorUserId: null,
        actorRole: null,
        source: AuditSource.PAYMENT_EVENT,
        beforeState,
        afterState: reservationPaymentAuditState(updatedReservation, payment.id),
        reason: input.reason ?? null,
        requestId: `${input.source}:${input.sourceEventId}`,
        reservationId: reservation.id,
        paymentId: payment.id,
        courtId: reservation.courtId,
        sportId: reservation.sportId
      },
      tx
    );

    return { duplicate: false, payment, reservation: updatedReservation };
  });
}

function resolveVenueFilter(
  actor: Pick<UserProfile, "role" | "venueId">,
  requestedVenueId?: string | null
): string | null {
  if (actor.role === "WALLY_ADMIN") {
    return requestedVenueId ?? null;
  }

  if (actor.role === "VENUE_ADMIN" && actor.venueId) {
    if (requestedVenueId && requestedVenueId !== actor.venueId) {
      throw new Error("No tienes permiso para revisar pagos de ese venue.");
    }

    return actor.venueId;
  }

  throw new Error("No tienes permiso para revisar historial de pagos.");
}

function assertPaymentTransition(currentStatus: PaymentStatus, nextStatus: PaymentStatus) {
  if (!canTransitionPaymentStatus(currentStatus, nextStatus)) {
    throw new Error("Ese cambio de estado de pago no está permitido.");
  }
}

function reservationPaymentAuditState(
  reservation: Pick<Reservation, "id" | "paymentStatus">,
  paymentId?: string
): Prisma.InputJsonObject {
  return {
    reservationId: reservation.id,
    paymentId: paymentId ?? null,
    paymentStatus: reservation.paymentStatus
  };
}

function paymentEventSummary(input: PaymentEventInput): Prisma.InputJsonObject {
  return {
    source: input.source,
    sourceEventId: input.sourceEventId,
    reservationId: input.reservationId,
    status: input.status,
    occurredAt: input.occurredAt ?? null
  };
}
