import { ReservationStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  getReservationForActor,
  listPlayerUpcomingReservations,
  type ReservationClient
} from "@/lib/data/reservations";

function mockClient(overrides: Record<string, unknown>): ReservationClient {
  return overrides as ReservationClient;
}

describe("reservas próximas del jugador", () => {
  it("consulta solo reservas confirmadas del jugador autenticado", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const now = new Date("2026-07-19T10:00:00.000Z");

    await listPlayerUpcomingReservations(
      {
        actor: { id: "player-1" },
        now
      },
      mockClient({
        reservation: { findMany }
      })
    );

    expect(findMany).toHaveBeenCalledWith({
      where: {
        playerId: "player-1",
        status: ReservationStatus.CONFIRMED,
        startAtUtc: { gte: now }
      },
      include: expect.any(Object),
      orderBy: { startAtUtc: "asc" }
    });
  });

  it("devuelve null cuando otro jugador intenta ver una reserva ajena", async () => {
    const reservation = {
      id: "reservation-1",
      playerId: "player-2",
      court: {
        id: "court-1",
        name: "Cancha 1",
        venueId: "venue-1"
      },
      sport: {
        id: "sport-1",
        name: "Wally",
        code: "wally"
      },
      player: {
        id: "player-2",
        displayName: "Jugador 2"
      }
    };

    const result = await getReservationForActor(
      {
        reservationId: "reservation-1",
        actor: {
          id: "player-1",
          role: "PLAYER",
          venueId: null
        }
      },
      mockClient({
        reservation: {
          findUnique: vi.fn().mockResolvedValue(reservation)
        }
      })
    );

    expect(result).toBeNull();
  });
});
