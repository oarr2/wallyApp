import { describe, expect, it } from "vitest";
import { generateSlotsFromScheduleRules } from "@/lib/data/schedules";
import { timeStringToDate } from "@/lib/time/la-paz";

const baseRule = {
  id: "rule-1",
  courtId: "court-1",
  dayOfWeek: 0,
  isActive: true,
  startLocalTime: timeStringToDate("08:00"),
  endLocalTime: timeStringToDate("11:00"),
  slotMinutes: 60
};

describe("generación de turnos desde horarios", () => {
  it("genera turnos deterministas sin parciales finales", () => {
    const slots = generateSlotsFromScheduleRules(
      [
        {
          ...baseRule,
          endLocalTime: timeStringToDate("10:30")
        }
      ],
      "2026-07-19"
    );

    expect(slots.map((slot) => [slot.startLocalTime, slot.endLocalTime])).toEqual([
      ["08:00:00", "09:00:00"],
      ["09:00:00", "10:00:00"]
    ]);
    expect(slots.map((slot) => slot.startAtUtc.toISOString())).toEqual([
      "2026-07-19T12:00:00.000Z",
      "2026-07-19T13:00:00.000Z"
    ]);
  });

  it("ignora reglas inactivas y ordena los turnos", () => {
    const slots = generateSlotsFromScheduleRules(
      [
        { ...baseRule, id: "inactive", isActive: false },
        {
          ...baseRule,
          id: "later",
          startLocalTime: timeStringToDate("12:00"),
          endLocalTime: timeStringToDate("13:00")
        },
        baseRule
      ],
      "2026-07-19"
    );

    expect(slots.map((slot) => slot.startLocalTime)).toEqual([
      "08:00:00",
      "09:00:00",
      "10:00:00",
      "12:00:00"
    ]);
  });

  it("rechaza horarios que generan turnos superpuestos", () => {
    expect(() =>
      generateSlotsFromScheduleRules(
        [
          baseRule,
          {
            ...baseRule,
            id: "overlap",
            startLocalTime: timeStringToDate("10:30"),
            endLocalTime: timeStringToDate("12:30")
          }
        ],
        "2026-07-19"
      )
    ).toThrow("superpuestos");
  });
});
