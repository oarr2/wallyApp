import { AuditEntityType, AuditSource, PaymentStatus, ReservationStatus, UserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  adminCancelReservation,
  getAdminReservationDetail,
  listAdminReservations
} from "@/lib/data/admin-reservations";

function reservationFixture() {
  return {
    id: "00000000-0000-4000-8000-000000000701",
    playerId: "00000000-0000-4000-8000-000000000801",
    courtId: "00000000-0000-4000-8000-000000000201",
    sportId: "00000000-0000-4000-8000-000000000301",
    localDate: new Date("2026-07-20T00:00:00.000Z"),
    startAtUtc: new Date("2026-07-20T12:00:00.000Z"),
    endAtUtc: new Date("2026-07-20T13:00:00.000Z"),
    startLocalTime: new Date("1970-01-01T08:00:00.000Z"),
    endLocalTime: new Date("1970-01-01T09:00:00.000Z"),
    status: ReservationStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PENDING,
    cancelledAt: null,
    cancelledByUserId: null,
    cancellationReason: null,
    court: { venueId: "00000000-0000-4000-8000-000000000101" }
  };
}

describe("administración de reservas", () => {
  it("filtra reservas por venue para Venue Administrator", async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    await listAdminReservations(
      {
        actor: {
          role: UserRole.VENUE_ADMIN,
          venueId: "00000000-0000-4000-8000-000000000101"
        },
        filters: { status: ReservationStatus.CONFIRMED }
      },
      { reservation: { findMany }, auditRecord: {} } as never
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ReservationStatus.CONFIRMED,
          court: { venueId: "00000000-0000-4000-8000-000000000101" }
        })
      })
    );
  });

  it("oculta detalle fuera de scope de venue", async () => {
    const result = await getAdminReservationDetail(
      {
        reservationId: "00000000-0000-4000-8000-000000000701",
        actor: {
          role: UserRole.VENUE_ADMIN,
          venueId: "00000000-0000-4000-8000-000000000999"
        }
      },
      {
        reservation: {
          findUnique: vi.fn().mockResolvedValue({
            ...reservationFixture(),
            payments: [],
            auditRecords: [],
            sport: { id: "sport", name: "Wally", code: "wally" },
            player: { id: "player", displayName: "Jugador", phone: null },
            court: {
              id: "court",
              name: "Cancha central",
              venueId: "00000000-0000-4000-8000-000000000101"
            }
          })
        },
        auditRecord: {}
      } as never
    );

    expect(result).toBeNull();
  });

  it("exige motivo de auditoría para cancelación administrativa", async () => {
    await expect(
      adminCancelReservation(
        {
          reservationId: "00000000-0000-4000-8000-000000000701",
          reason: " ",
          actor: {
            id: "00000000-0000-4000-8000-000000000401",
            role: UserRole.VENUE_ADMIN,
            venueId: "00000000-0000-4000-8000-000000000101"
          }
        },
        { $transaction: vi.fn() } as never
      )
    ).rejects.toThrow("motivo");
  });

  it("cancela reserva en scope y escribe auditoría con motivo", async () => {
    const reservation = reservationFixture();
    const tx = {
      reservation: {
        findUnique: vi.fn().mockResolvedValue(reservation),
        update: vi.fn().mockResolvedValue({
          ...reservation,
          status: ReservationStatus.CANCELLED,
          cancelledAt: new Date("2026-07-19T15:00:00.000Z"),
          cancelledByUserId: "00000000-0000-4000-8000-000000000401",
          cancellationReason: "Mantenimiento urgente"
        })
      },
      auditRecord: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) }
    };
    const runner = { $transaction: vi.fn((callback) => callback(tx)) };

    await adminCancelReservation(
      {
        reservationId: reservation.id,
        reason: "Mantenimiento urgente",
        actor: {
          id: "00000000-0000-4000-8000-000000000401",
          role: UserRole.VENUE_ADMIN,
          venueId: "00000000-0000-4000-8000-000000000101"
        }
      },
      runner
    );

    expect(tx.reservation.update).toHaveBeenCalledWith({
      where: { id: reservation.id },
      data: expect.objectContaining({
        status: ReservationStatus.CANCELLED,
        cancellationReason: "Mantenimiento urgente"
      })
    });
    expect(tx.auditRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: AuditEntityType.RESERVATION,
        action: "RESERVATION_CANCELLED_BY_ADMIN",
        source: AuditSource.USER,
        reason: "Mantenimiento urgente"
      })
    });
  });
});
