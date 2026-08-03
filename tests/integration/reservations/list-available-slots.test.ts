import { AvailabilityOverrideType, ReservationStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { listAvailableSlots, type ReservationClient } from "@/lib/data/reservations";
import { localDateStringToDate, timeStringToDate } from "@/lib/time/la-paz";

function mockClient(overrides: Record<string, unknown>): ReservationClient {
  return overrides as ReservationClient;
}

describe("listado de horarios disponibles", () => {
  it("genera turnos desde horarios activos y oculta reservas confirmadas", async () => {
    const slots = await listAvailableSlots(
      {
        courtId: "00000000-0000-4000-8000-000000000101",
        sportId: "00000000-0000-4000-8000-000000000201",
        localDate: "2026-07-19"
      },
      mockClient({
        courtSport: {
          findFirst: vi.fn().mockResolvedValue({ courtId: "court-1" })
        },
        scheduleRule: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "rule-1",
              courtId: "00000000-0000-4000-8000-000000000101",
              dayOfWeek: 0,
              isActive: true,
              startLocalTime: timeStringToDate("08:00"),
              endLocalTime: timeStringToDate("11:00"),
              slotMinutes: 60
            }
          ])
        },
        availabilityOverride: {
          findMany: vi.fn().mockResolvedValue([])
        },
        reservation: {
          findMany: vi.fn().mockResolvedValue([
            {
              startAtUtc: new Date("2026-07-19T13:00:00.000Z"),
              endAtUtc: new Date("2026-07-19T14:00:00.000Z")
            }
          ])
        }
      })
    );

    expect(slots.map((slot) => slot.startLocalTime)).toEqual(["08:00:00", "10:00:00"]);
  });

  it("aplica bloqueos de disponibilidad antes de devolver horarios", async () => {
    const slots = await listAvailableSlots(
      {
        courtId: "00000000-0000-4000-8000-000000000101",
        sportId: "00000000-0000-4000-8000-000000000201",
        localDate: "2026-07-19"
      },
      mockClient({
        courtSport: {
          findFirst: vi.fn().mockResolvedValue({ courtId: "court-1" })
        },
        scheduleRule: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "rule-1",
              courtId: "00000000-0000-4000-8000-000000000101",
              dayOfWeek: 0,
              isActive: true,
              startLocalTime: timeStringToDate("08:00"),
              endLocalTime: timeStringToDate("10:00"),
              slotMinutes: 60
            }
          ])
        },
        availabilityOverride: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "override-1",
              courtId: "00000000-0000-4000-8000-000000000101",
              localDate: localDateStringToDate("2026-07-19"),
              startLocalTime: timeStringToDate("08:00"),
              endLocalTime: timeStringToDate("09:00"),
              type: AvailabilityOverrideType.BLOCKED
            }
          ])
        },
        reservation: {
          findMany: vi.fn().mockResolvedValue([])
        }
      })
    );

    expect(slots.map((slot) => slot.startLocalTime)).toEqual(["09:00:00"]);
  });

  it("consulta solo reservas activas para la cancha y fecha seleccionadas", async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    await listAvailableSlots(
      {
        courtId: "00000000-0000-4000-8000-000000000101",
        sportId: "00000000-0000-4000-8000-000000000201",
        localDate: "2026-07-19"
      },
      mockClient({
        courtSport: {
          findFirst: vi.fn().mockResolvedValue({ courtId: "court-1" })
        },
        scheduleRule: {
          findMany: vi.fn().mockResolvedValue([])
        },
        availabilityOverride: {
          findMany: vi.fn().mockResolvedValue([])
        },
        reservation: {
          findMany
        }
      })
    );

    expect(findMany).toHaveBeenCalledWith({
      where: {
        courtId: "00000000-0000-4000-8000-000000000101",
        localDate: localDateStringToDate("2026-07-19"),
        status: { in: [ReservationStatus.CONFIRMED] }
      },
      select: {
        startAtUtc: true,
        endAtUtc: true
      }
    });
  });
});
