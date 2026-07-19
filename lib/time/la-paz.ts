export const LA_PAZ_TIMEZONE = "America/La_Paz";
export const LA_PAZ_UTC_OFFSET_MINUTES = -240;

const localDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: LA_PAZ_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const localDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: LA_PAZ_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23"
});

export type LocalDateParts = {
  year: number;
  month: number;
  day: number;
};

export type LocalTimeParts = {
  hour: number;
  minute: number;
  second: number;
};

export type LaPazLocalDateTime = LocalDateParts & LocalTimeParts;

export function localDateStringToDate(localDate: string): Date {
  const [year, month, day] = parseLocalDateString(localDate);
  return new Date(Date.UTC(year, month - 1, day));
}

export function timeStringToDate(time: string): Date {
  const [hour, minute, second] = parseLocalTimeString(time);
  return new Date(Date.UTC(1970, 0, 1, hour, minute, second));
}

export function dateToLocalDateString(date: Date): string {
  return localDateFormatter.format(date);
}

export function dateToLocalTimeString(date: Date): string {
  const parts = getFormatterParts(localDateTimeFormatter, date);
  return `${parts.hour}:${parts.minute}:${parts.second}`;
}

export function timeDateToMinutes(time: Date): number {
  return time.getUTCHours() * 60 + time.getUTCMinutes();
}

export function minutesToTimeDate(minutes: number): Date {
  const normalizedMinutes = assertMinuteOfDay(minutes);
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  return new Date(Date.UTC(1970, 0, 1, hour, minute, 0));
}

export function localDateAndMinutesToUtc(
  localDate: string | Date,
  minutes: number
): Date {
  const dateParts =
    typeof localDate === "string"
      ? parseLocalDateString(localDate)
      : [
          localDate.getUTCFullYear(),
          localDate.getUTCMonth() + 1,
          localDate.getUTCDate()
        ];
  const normalizedMinutes = assertMinuteOfDay(minutes);
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;

  return new Date(
    Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], hour + 4, minute, 0)
  );
}

export function utcToLaPazLocalDateTime(date: Date): LaPazLocalDateTime {
  const parts = getFormatterParts(localDateTimeFormatter, date);

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

export function getLaPazDayOfWeek(localDate: string | Date): number {
  const date =
    typeof localDate === "string" ? localDateStringToDate(localDate) : localDate;
  return date.getUTCDay();
}

export function assertValidTimeRange(startMinutes: number, endMinutes: number) {
  assertMinuteOfDay(startMinutes);
  assertMinuteOfDay(endMinutes, { allowEndOfDay: true });

  if (startMinutes >= endMinutes) {
    throw new Error("La hora de inicio debe ser anterior a la hora de fin.");
  }
}

function parseLocalDateString(localDate: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);

  if (!match) {
    throw new Error("La fecha local debe usar el formato YYYY-MM-DD.");
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function parseLocalTimeString(time: string): [number, number, number] {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);

  if (!match) {
    throw new Error("La hora local debe usar el formato HH:mm o HH:mm:ss.");
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? "0");

  if (hour > 23 || minute > 59 || second > 59) {
    throw new Error("La hora local está fuera de rango.");
  }

  return [hour, minute, second];
}

function assertMinuteOfDay(
  minutes: number,
  options: { allowEndOfDay?: boolean } = {}
): number {
  const max = options.allowEndOfDay ? 1440 : 1439;

  if (!Number.isInteger(minutes) || minutes < 0 || minutes > max) {
    throw new Error("Los minutos locales están fuera de rango.");
  }

  return minutes;
}

function getFormatterParts(
  formatter: Intl.DateTimeFormat,
  date: Date
): Record<string, string> {
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
}
