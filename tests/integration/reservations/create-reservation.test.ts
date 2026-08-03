import { AuditEntityType, AuditSource, PaymentStatus, ReservationStatus, UserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { createReservation } from "@/lib/data/reservations";
import { localDateStringToDate, timeStringToDate } from "@/lib/time/la-paz";

describe("creación de reservas", () => {
  it("crea una reserva pendiente dentro de una transacción y escribe auditoría", async () => {
    const reservation = {
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
      paymentStatus: PaymentStatus.PENDING,
      cancelledAt: null,
      cancelledByUserId: null,
      cancellationReason: null,
      createdAt: new Date("2026-07-18T12:00:00.000Z"),
      updatedAt: new Date("2026-07-18T12:00:00.000Z")
    };
    const tx = {
      courtSport: { findFirst: vi.fn().mockResolvedValue({ courtId: reservation.courtId }) },
      scheduleRule: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "rule-1",
            courtId: reservation.courtId,
            dayOfWeek: 0,
            isActive: true,
            startLocalTime: timeStringToDate("08:00"),
            endLocalTime: timeStringToDate("10:00"),
            slotMinutes: 60
          }
        ])
      },
      availabilityOverride: { findMany: vi.fn().mockResolvedValue([]) },
      reservation: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue(reservation)
      },
      auditRecord: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) }
    };
    const runner = {
      $transaction: vi.fn((callback) => callback(tx))
    };

    const result = await createReservation(
      {
        actor: {
          id: reservation.playerId,
          role: UserRole.PLAYER
        },
        courtId: reservation.courtId,
        sportId: reservation.sportId,
        localDate: "2026-07-19",
        startLocalTime: "08:00:00",
        endLocalTime: "09:00:00"
      },
      runner
    );

    expect(result).toEqual(reservation);
    expect(tx.reservation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        playerId: reservation.playerId,
        status: ReservationStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING
      })
    });
    expect(tx.auditRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: AuditEntityType.RESERVATION,
        action: "RESERVATION_CREATED",
        source: AuditSource.USER,
        reservationId: reservation.id
      })
    });
  });

  it("rechaza un horario que dejó de estar disponible", async () => {
    const tx = {
      courtSport: { findFirst: vi.fn().mockResolvedValue({ courtId: "court-1" }) },
      scheduleRule: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "rule-1",
            courtId: "00000000-0000-4000-8000-000000000101",
            dayOfWeek: 0,
            isActive: true,
            startLocalTime: timeStringToDate("08:00"),
            endLocalTime: timeStringToDate("09:00"),
            slotMinutes: 60
          }
        ])
      },
      availabilityOverride: { findMany: vi.fn().mockResolvedValue([]) },
      reservation: {
        findMany: vi.fn().mockResolvedValue([
          {
            startAtUtc: new Date("2026-07-19T12:00:00.000Z"),
            endAtUtc: new Date("2026-07-19T13:00:00.000Z")
          }
        ]),
        create: vi.fn()
      },
      auditRecord: { create: vi.fn() }
    };
    const runner = {
      $transaction: vi.fn((callback) => callback(tx))
    };

    await expect(
      createReservation(
        {
          actor: {
            id: "00000000-0000-4000-8000-000000000001",
            role: UserRole.PLAYER
          },
          courtId: "00000000-0000-4000-8000-000000000101",
          sportId: "00000000-0000-4000-8000-000000000201",
          localDate: "2026-07-19",
          startLocalTime: "08:00:00",
          endLocalTime: "09:00:00"
        },
        runner
      )
    ).rejects.toThrow("ya no está disponible");
    expect(tx.reservation.create).not.toHaveBeenCalled();
  });
});
