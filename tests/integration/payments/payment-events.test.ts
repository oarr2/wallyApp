import {
  AuditEntityType,
  AuditSource,
  PaymentEventStatus,
  PaymentSource,
  PaymentStatus,
  ReservationStatus
} from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { processPaymentEvent } from "@/lib/data/payments";
import { localDateStringToDate, timeStringToDate } from "@/lib/time/la-paz";

function reservation(status: PaymentStatus = PaymentStatus.PENDING) {
  return {
    id: "00000000-0000-4000-8000-000000000301",
    playerId: "00000000-0000-4000-8000-000000000001",
    courtId: "00000000-0000-4000-8000-000000000101",
    sportId: "00000000-0000-4000-8000-000000000201",
    localDate: localDateStringToDate("2026-07-19"),
    startAtUtc: new Date("2026-07-19T12:00:00.000Z"),
    endAtUtc: new Date("2026-07-19T13:00:00.000Z"),
    startLocalTime: timeStringToDate("08:00"),
    endLocalTime: timeStringToDate("09:00"),
    status: ReservationStatus.CONFIRMED,
    paymentStatus: status,
    cancelledAt: null,
    cancelledByUserId: null,
    cancellationReason: null,
    createdAt: new Date("2026-07-18T12:00:00.000Z"),
    updatedAt: new Date("2026-07-18T12:00:00.000Z")
  };
}

describe("eventos de pago idempotentes", () => {
  it("procesa un evento nuevo, sincroniza reserva y escribe auditoría", async () => {
    const baseReservation = reservation();
    const updatedReservation = {
      ...baseReservation,
      paymentStatus: PaymentStatus.PAID
    };
    const payment = {
      id: "00000000-0000-4000-8000-000000000401",
      reservationId: baseReservation.id,
      status: PaymentStatus.PAID,
      amount: null,
      currency: "BOB",
      source: PaymentSource.EVENT,
      sourceReference: "pasarela:event-1",
      reason: "Pago confirmado",
      createdByUserId: null,
      createdAt: new Date("2026-07-18T13:00:00.000Z")
    };
    const tx = {
      paymentEvent: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "event-row-1" }),
        update: vi.fn().mockResolvedValue({})
      },
      reservation: {
        findUnique: vi.fn().mockResolvedValue(baseReservation),
        update: vi.fn().mockResolvedValue(updatedReservation)
      },
      payment: {
        create: vi.fn().mockResolvedValue(payment)
      },
      auditRecord: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" })
      }
    };
    const runner = {
      $transaction: vi.fn((callback) => callback(tx))
    } as unknown as Parameters<typeof processPaymentEvent>[1];

    const result = await processPaymentEvent(
      {
        source: "pasarela",
        sourceEventId: "event-1",
        reservationId: baseReservation.id,
        status: PaymentStatus.PAID,
        reason: "Pago confirmado",
        occurredAt: "2026-07-18T13:00:00.000Z"
      },
      runner
    );

    expect(result.duplicate).toBe(false);
    expect(tx.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reservationId: baseReservation.id,
        status: PaymentStatus.PAID,
        source: PaymentSource.EVENT,
        sourceReference: "pasarela:event-1"
      })
    });
    expect(tx.reservation.update).toHaveBeenCalledWith({
      where: { id: baseReservation.id },
      data: { paymentStatus: PaymentStatus.PAID }
    });
    expect(tx.paymentEvent.update).toHaveBeenCalledWith({
      where: { id: "event-row-1" },
      data: expect.objectContaining({
        status: PaymentEventStatus.PROCESSED
      })
    });
    expect(tx.auditRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: AuditEntityType.PAYMENT,
        action: "PAYMENT_EVENT_PROCESSED",
        source: AuditSource.PAYMENT_EVENT,
        requestId: "pasarela:event-1"
      })
    });
  });

  it("ignora un evento duplicado sin crear nuevo pago", async () => {
    const tx = {
      paymentEvent: {
        findUnique: vi.fn().mockResolvedValue({ id: "event-row-1" })
      },
      reservation: {
        findUnique: vi.fn()
      },
      payment: {
        create: vi.fn()
      },
      auditRecord: {
        create: vi.fn()
      }
    };
    const runner = {
      $transaction: vi.fn((callback) => callback(tx))
    } as unknown as Parameters<typeof processPaymentEvent>[1];

    const result = await processPaymentEvent(
      {
        source: "pasarela",
        sourceEventId: "event-1",
        reservationId: "00000000-0000-4000-8000-000000000301",
        status: PaymentStatus.PAID
      },
      runner
    );

    expect(result.duplicate).toBe(true);
    expect(tx.payment.create).not.toHaveBeenCalled();
    expect(tx.auditRecord.create).not.toHaveBeenCalled();
  });
});
