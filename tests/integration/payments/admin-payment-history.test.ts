import { PaymentStatus, UserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  listAdminPaymentHistory,
  listPaymentHistoryForReservation,
  updatePaymentStatus
} from "@/lib/data/payments";

function mockClient(overrides: Record<string, unknown>) {
  return overrides as Parameters<typeof listAdminPaymentHistory>[1];
}

describe("historial de pagos administrativo", () => {
  it("aplica scope de venue para Venue Administrator", async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    await listAdminPaymentHistory(
      {
        actor: {
          role: UserRole.VENUE_ADMIN,
          venueId: "venue-1"
        }
      },
      mockClient({
        payment: { findMany }
      })
    );

    expect(findMany).toHaveBeenCalledWith({
      where: {
        reservation: {
          court: { venueId: "venue-1" }
        }
      },
      include: expect.any(Object),
      orderBy: { createdAt: "desc" }
    });
  });

  it("bloquea historial administrativo para Player", async () => {
    await expect(
      listAdminPaymentHistory(
        {
          actor: {
            role: UserRole.PLAYER,
            venueId: null
          }
        },
        mockClient({
          payment: { findMany: vi.fn() }
        })
      )
    ).rejects.toThrow("No tienes permiso");
  });

  it("permite al dueño ver historial de pago de su reserva", async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    await listPaymentHistoryForReservation(
      {
        reservationId: "reservation-1",
        actor: {
          id: "player-1",
          role: UserRole.PLAYER,
          venueId: null
        }
      },
      {
        reservation: {
          findUnique: vi.fn().mockResolvedValue({
            id: "reservation-1",
            playerId: "player-1",
            court: { venueId: "venue-1" }
          })
        },
        payment: { findMany }
      } as unknown as Parameters<typeof listPaymentHistoryForReservation>[1]
    );

    expect(findMany).toHaveBeenCalledWith({
      where: { reservationId: "reservation-1" },
      orderBy: { createdAt: "desc" }
    });
  });

  it("actualiza estado manual con auditoría cuando el admin tiene scope", async () => {
    const reservation = {
      id: "reservation-1",
      courtId: "court-1",
      sportId: "sport-1",
      paymentStatus: PaymentStatus.PENDING,
      court: { venueId: "venue-1" }
    };
    const payment = {
      id: "payment-1",
      reservationId: "reservation-1",
      status: PaymentStatus.PAID
    };
    const tx = {
      reservation: {
        findUnique: vi.fn().mockResolvedValue(reservation),
        update: vi.fn().mockResolvedValue({
          ...reservation,
          paymentStatus: PaymentStatus.PAID
        })
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
    } as unknown as Parameters<typeof updatePaymentStatus>[1];

    await updatePaymentStatus(
      {
        actor: {
          id: "admin-1",
          role: UserRole.VENUE_ADMIN,
          venueId: "venue-1"
        },
        reservationId: "reservation-1",
        status: PaymentStatus.PAID,
        reason: "Pago confirmado en caja",
        currency: "BOB"
      },
      runner
    );

    expect(tx.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reservationId: "reservation-1",
        status: PaymentStatus.PAID,
        reason: "Pago confirmado en caja",
        createdByUserId: "admin-1"
      })
    });
    expect(tx.auditRecord.create).toHaveBeenCalledOnce();
  });
});
