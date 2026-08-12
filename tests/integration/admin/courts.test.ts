import { AuditEntityType, AuditSource, UserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { listAdminCourts, upsertCourtForAdmin } from "@/lib/data/courts";

describe("administración de canchas", () => {
  it("limita a Venue Administrator al venue permitido", async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    await listAdminCourts(
      {
        actor: {
          role: UserRole.VENUE_ADMIN,
          venueId: "00000000-0000-4000-8000-000000000101"
        }
      },
      {
        court: { findMany },
        sport: {},
        courtSport: {},
        auditRecord: {}
      } as never
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { venueId: "00000000-0000-4000-8000-000000000101" }
      })
    );
  });

  it("permite acceso global a Wally Administrator", async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    await listAdminCourts(
      {
        actor: {
          role: UserRole.WALLY_ADMIN,
          venueId: null
        }
      },
      {
        court: { findMany },
        sport: {},
        courtSport: {},
        auditRecord: {}
      } as never
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined
      })
    );
  });

  it("crea cancha con deportes activos y auditoría", async () => {
    const court = {
      id: "00000000-0000-4000-8000-000000000201",
      venueId: "00000000-0000-4000-8000-000000000101",
      name: "Cancha central",
      description: null,
      isActive: true,
      displayOrder: 1
    };
    const tx = {
      sport: {
        findMany: vi.fn().mockResolvedValue([
          { id: "00000000-0000-4000-8000-000000000301" }
        ])
      },
      court: {
        create: vi.fn().mockResolvedValue(court),
        findUnique: vi.fn().mockResolvedValue({ ...court, courtSports: [] })
      },
      courtSport: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        createMany: vi.fn().mockResolvedValue({ count: 1 })
      },
      auditRecord: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) }
    };
    const runner = { $transaction: vi.fn((callback) => callback(tx)) };

    await upsertCourtForAdmin(
      {
        actor: {
          id: "00000000-0000-4000-8000-000000000401",
          role: UserRole.VENUE_ADMIN,
          venueId: court.venueId
        },
        venueId: court.venueId,
        name: court.name,
        description: null,
        isActive: true,
        displayOrder: 1,
        sportIds: ["00000000-0000-4000-8000-000000000301"]
      },
      runner
    );

    expect(tx.court.create).toHaveBeenCalledOnce();
    expect(tx.auditRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: AuditEntityType.COURT,
        action: "COURT_CREATED",
        source: AuditSource.USER,
        actorUserId: "00000000-0000-4000-8000-000000000401"
      })
    });
  });

  it("rechaza cambios fuera del venue del administrador", async () => {
    const runner = { $transaction: vi.fn((callback) => callback({})) };

    await expect(
      upsertCourtForAdmin(
        {
          actor: {
            id: "00000000-0000-4000-8000-000000000401",
            role: UserRole.VENUE_ADMIN,
            venueId: "00000000-0000-4000-8000-000000000101"
          },
          venueId: "00000000-0000-4000-8000-000000000999",
          name: "Cancha externa",
          isActive: true,
          displayOrder: 2,
          sportIds: ["00000000-0000-4000-8000-000000000301"]
        },
        runner
      )
    ).rejects.toThrow("No tienes permiso");
  });
});
