import { AuditEntityType, AuditSource, AvailabilityOverrideType, UserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { upsertAvailabilityOverrideForAdmin } from "@/lib/data/availability";
import { listAvailableSlots } from "@/lib/data/reservations";
import { upsertScheduleRuleForAdmin } from "@/lib/data/schedules";
import { localDateStringToDate, timeStringToDate } from "@/lib/time/la-paz";

describe("administración de horarios y disponibilidad", () => {
  it("crea horario con auditoría para una cancha dentro de scope", async () => {
    const rule = {
      id: "00000000-0000-4000-8000-000000000501",
      courtId: "00000000-0000-4000-8000-000000000201",
      dayOfWeek: 1,
      startLocalTime: timeStringToDate("08:00"),
      endLocalTime: timeStringToDate("10:00"),
      slotMinutes: 60,
      cancellationCutoffMinutes: 120,
      isActive: true
    };
    const tx = {
      court: {
        findUnique: vi.fn().mockResolvedValue({
          id: rule.courtId,
          venueId: "00000000-0000-4000-8000-000000000101"
        })
      },
      scheduleRule: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue(rule)
      },
      auditRecord: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) }
    };
    const runner = { $transaction: vi.fn((callback) => callback(tx)) };

    await upsertScheduleRuleForAdmin(
      {
        actor: {
          id: "00000000-0000-4000-8000-000000000401",
          role: UserRole.VENUE_ADMIN,
          venueId: "00000000-0000-4000-8000-000000000101"
        },
        courtId: rule.courtId,
        dayOfWeek: 1,
        startLocalTime: "08:00",
        endLocalTime: "10:00",
        slotMinutes: 60,
        cancellationCutoffMinutes: 120,
        isActive: true
      },
      runner
    );

    expect(tx.auditRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: AuditEntityType.SCHEDULE_RULE,
        action: "SCHEDULE_RULE_CREATED"
      })
    });
  });

  it("crea bloqueo de disponibilidad con auditoría", async () => {
    const override = {
      id: "00000000-0000-4000-8000-000000000601",
      courtId: "00000000-0000-4000-8000-000000000201",
      localDate: localDateStringToDate("2026-07-20"),
      startLocalTime: timeStringToDate("08:00"),
      endLocalTime: timeStringToDate("09:00"),
      type: AvailabilityOverrideType.BLOCKED,
      reason: "Mantenimiento",
      createdByUserId: "00000000-0000-4000-8000-000000000401"
    };
    const tx = {
      court: {
        findUnique: vi.fn().mockResolvedValue({
          id: override.courtId,
          venueId: "00000000-0000-4000-8000-000000000101"
        })
      },
      availabilityOverride: {
        create: vi.fn().mockResolvedValue(override)
      },
      auditRecord: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) }
    };
    const runner = { $transaction: vi.fn((callback) => callback(tx)) };

    await upsertAvailabilityOverrideForAdmin(
      {
        actor: {
          id: override.createdByUserId,
          role: UserRole.VENUE_ADMIN,
          venueId: "00000000-0000-4000-8000-000000000101"
        },
        courtId: override.courtId,
        localDate: "2026-07-20",
        type: AvailabilityOverrideType.BLOCKED,
        startLocalTime: "08:00",
        endLocalTime: "09:00",
        reason: "Mantenimiento"
      },
      runner
    );

    expect(tx.auditRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: AuditEntityType.AVAILABILITY_OVERRIDE,
        action: "AVAILABILITY_OVERRIDE_CREATED",
        source: AuditSource.USER,
        reason: "Mantenimiento"
      })
    });
  });

  it("el bloqueo deja el turno no reservable para jugadores", async () => {
    const courtId = "00000000-0000-4000-8000-000000000201";
    const sportId = "00000000-0000-4000-8000-000000000301";
    const slots = await listAvailableSlots(
      {
        courtId,
        sportId,
        localDate: "2026-07-20"
      },
      {
        courtSport: { findFirst: vi.fn().mockResolvedValue({ courtId }) },
        scheduleRule: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "rule-1",
              courtId,
              dayOfWeek: 1,
              isActive: true,
              startLocalTime: timeStringToDate("08:00"),
              endLocalTime: timeStringToDate("09:00"),
              slotMinutes: 60
            }
          ])
        },
        availabilityOverride: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "override-1",
              courtId,
              localDate: localDateStringToDate("2026-07-20"),
              startLocalTime: timeStringToDate("08:00"),
              endLocalTime: timeStringToDate("09:00"),
              type: AvailabilityOverrideType.BLOCKED
            }
          ])
        },
        reservation: { findMany: vi.fn().mockResolvedValue([]) }
      } as never
    );

    expect(slots).toEqual([]);
  });
});
