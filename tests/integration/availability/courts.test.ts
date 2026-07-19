import { UserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  type CourtClient,
  listActiveCourtsForAdminVenue,
  listActiveCourtsForVenue,
  listActiveSportsForCourt
} from "@/lib/data/courts";

function mockCourtClient(input: {
  court: Record<string, unknown>;
  sport?: Record<string, unknown>;
}): CourtClient {
  return {
    court: input.court,
    sport: input.sport ?? { findMany: vi.fn() }
  } as unknown as CourtClient;
}

describe("filtrado activo de canchas y deportes", () => {
  it("consulta solo canchas activas del venue con deportes activos asignados", async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    await listActiveCourtsForVenue(
      "venue-1",
      mockCourtClient({ court: { findMany } })
    );

    expect(findMany).toHaveBeenCalledWith({
      where: {
        venueId: "venue-1",
        isActive: true
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
      orderBy: { displayOrder: "asc" }
    });
  });

  it("enforcea scope de venue para consultas administrativas", async () => {
    await expect(
      listActiveCourtsForAdminVenue(
        {
          actor: { role: UserRole.VENUE_ADMIN, venueId: "venue-2" },
          venueId: "venue-1"
        },
        mockCourtClient({ court: { findMany: vi.fn() } })
      )
    ).rejects.toThrow("No tienes permiso");
  });

  it("permite a Wally Administrator consultar cualquier venue", async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    await listActiveCourtsForAdminVenue(
      {
        actor: { role: UserRole.WALLY_ADMIN, venueId: null },
        venueId: "venue-1"
      },
      mockCourtClient({ court: { findMany } })
    );

    expect(findMany).toHaveBeenCalledOnce();
  });

  it("devuelve solo deportes activos de una cancha activa", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      courtSports: [
        { sport: { id: "sport-1", code: "wally", name: "Wally", isActive: true } }
      ]
    });

    const sports = await listActiveSportsForCourt(
      "court-1",
      mockCourtClient({ court: { findFirst } })
    );

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "court-1",
        isActive: true
      },
      select: {
        courtSports: {
          where: {
            isActive: true,
            sport: { isActive: true }
          },
          include: { sport: true },
          orderBy: { sport: { name: "asc" } }
        }
      }
    });
    expect(sports).toEqual([
      { id: "sport-1", code: "wally", name: "Wally", isActive: true }
    ]);
  });
});
