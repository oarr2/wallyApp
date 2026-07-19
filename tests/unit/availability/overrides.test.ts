import { AvailabilityOverrideType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { applyAvailabilityOverrides } from "@/lib/data/availability";
import { generateSlotsFromScheduleRules } from "@/lib/data/schedules";
import { localDateStringToDate, timeStringToDate } from "@/lib/time/la-paz";

const slots = generateSlotsFromScheduleRules(
  [
    {
      id: "rule-1",
      courtId: "court-1",
      dayOfWeek: 0,
      isActive: true,
      startLocalTime: timeStringToDate("08:00"),
      endLocalTime: timeStringToDate("12:00"),
      slotMinutes: 60
    }
  ],
  "2026-07-19"
);

describe("ajustes de disponibilidad", () => {
  it("cierra todo el día con precedencia sobre otros ajustes", () => {
    const result = applyAvailabilityOverrides(slots, [
      {
        id: "closed",
        courtId: "court-1",
        localDate: localDateStringToDate("2026-07-19"),
        type: AvailabilityOverrideType.CLOSED_DAY,
        startLocalTime: null,
        endLocalTime: null
      },
      {
        id: "open",
        courtId: "court-1",
        localDate: localDateStringToDate("2026-07-19"),
        type: AvailabilityOverrideType.OPEN_EXTRA,
        startLocalTime: timeStringToDate("13:00"),
        endLocalTime: timeStringToDate("14:00")
      }
    ]);

    expect(result).toEqual([]);
  });

  it("bloquea cualquier turno que se superpone al rango bloqueado", () => {
    const result = applyAvailabilityOverrides(slots, [
      {
        id: "blocked",
        courtId: "court-1",
        localDate: localDateStringToDate("2026-07-19"),
        type: AvailabilityOverrideType.BLOCKED,
        startLocalTime: timeStringToDate("09:30"),
        endLocalTime: timeStringToDate("10:30")
      }
    ]);

    expect(result.map((slot) => slot.startLocalTime)).toEqual([
      "08:00:00",
      "11:00:00"
    ]);
  });

  it("agrega turnos extras y luego aplica bloqueos", () => {
    const result = applyAvailabilityOverrides(slots, [
      {
        id: "open-extra",
        courtId: "court-1",
        localDate: localDateStringToDate("2026-07-19"),
        type: AvailabilityOverrideType.OPEN_EXTRA,
        startLocalTime: timeStringToDate("13:00"),
        endLocalTime: timeStringToDate("15:00")
      },
      {
        id: "blocked-extra",
        courtId: "court-1",
        localDate: localDateStringToDate("2026-07-19"),
        type: AvailabilityOverrideType.BLOCKED,
        startLocalTime: timeStringToDate("14:00"),
        endLocalTime: timeStringToDate("15:00")
      }
    ]);

    expect(result.map((slot) => [slot.startLocalTime, slot.endLocalTime])).toEqual([
      ["08:00:00", "09:00:00"],
      ["09:00:00", "10:00:00"],
      ["10:00:00", "11:00:00"],
      ["11:00:00", "12:00:00"],
      ["13:00:00", "14:00:00"]
    ]);
  });
});
