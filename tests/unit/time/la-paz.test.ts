import { describe, expect, it } from "vitest";
import {
  dateToLocalDateString,
  dateToLocalTimeString,
  getLaPazDayOfWeek,
  localDateAndMinutesToUtc,
  localDateStringToDate,
  timeDateToMinutes,
  timeStringToDate,
  utcToLaPazLocalDateTime
} from "@/lib/time/la-paz";

describe("helpers de fecha y hora de La Paz", () => {
  it("convierte fecha y minutos locales a instantes UTC preservando America/La_Paz", () => {
    const utc = localDateAndMinutesToUtc("2026-07-19", 8 * 60 + 30);

    expect(utc.toISOString()).toBe("2026-07-19T12:30:00.000Z");
    expect(dateToLocalDateString(utc)).toBe("2026-07-19");
    expect(dateToLocalTimeString(utc)).toBe("08:30:00");
  });

  it("convierte instantes UTC al calendario local de La Paz", () => {
    const local = utcToLaPazLocalDateTime(new Date("2026-07-19T03:59:59.000Z"));

    expect(local).toEqual({
      year: 2026,
      month: 7,
      day: 18,
      hour: 23,
      minute: 59,
      second: 59
    });
  });

  it("normaliza fechas locales y tiempos almacenados como Date UTC", () => {
    expect(localDateStringToDate("2026-07-19").toISOString()).toBe(
      "2026-07-19T00:00:00.000Z"
    );
    expect(timeStringToDate("14:45").toISOString()).toBe(
      "1970-01-01T14:45:00.000Z"
    );
    expect(timeDateToMinutes(timeStringToDate("14:45"))).toBe(14 * 60 + 45);
  });

  it("calcula el día de semana usando la fecha local", () => {
    expect(getLaPazDayOfWeek("2026-07-19")).toBe(0);
    expect(getLaPazDayOfWeek("2026-07-20")).toBe(1);
  });
});
