/**
 * Date and duration values of an iCalendar stream (RFC 5545 §3.3.4 / §3.3.5 /
 * §3.3.6), turned into plain `Date`s.
 *
 * A DTSTART comes in one of four shapes, and they do not mean the same instant:
 * a bare date (`VALUE=DATE`), a UTC stamp (`...Z`), a stamp in a named zone
 * (`TZID=Europe/Paris`), or a "floating" stamp with no zone at all — which by
 * spec means whatever local time the reader is in. Only the named-zone case
 * needs real work, and `Intl` already carries the zone database, so no
 * dependency is required for it.
 */

const DATE_TIME_PATTERN =
  /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/;

const DURATION_PATTERN =
  /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/** One date value of the stream, plus whether it carried a time at all. */
export type IcalDate = {
  date: Date;
  /** `VALUE=DATE`: the event spans whole days and has no clock time. */
  allDay: boolean;
};

/** Zone formatters are expensive to build and a feed reuses the same few zones. */
const formatterCache = new Map<string, Intl.DateTimeFormat | null>();

const formatterFor = (timeZone: string): Intl.DateTimeFormat | null => {
  if (formatterCache.has(timeZone)) return formatterCache.get(timeZone) ?? null;

  let formatter: Intl.DateTimeFormat | null = null;
  try {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    // An unknown or Windows-style TZID ("Romance Standard Time"): unusable.
    formatter = null;
  }
  formatterCache.set(timeZone, formatter);
  return formatter;
};

/** How far the zone runs ahead of UTC at that instant, in milliseconds. */
const zoneOffsetMs = (
  instantMs: number,
  formatter: Intl.DateTimeFormat,
): number => {
  const parts = formatter.formatToParts(new Date(instantMs));
  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);

  const wallClockMs = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour"),
    read("minute"),
    read("second"),
  );
  return wallClockMs - instantMs;
};

/**
 * The instant at which the given wall clock reading happens in `timeZone`.
 *
 * The offset depends on the instant we are looking for, so the first pass uses
 * the offset at the wrong instant and the second one corrects it. Two passes
 * settle every case except a reading that does not exist (the hour skipped by a
 * spring-forward), where any answer is a convention.
 */
const wallClockToUtc = (wallClockMs: number, timeZone: string): number => {
  const formatter = formatterFor(timeZone);
  if (!formatter) return Number.NaN;

  const firstPass = wallClockMs - zoneOffsetMs(wallClockMs, formatter);
  return wallClockMs - zoneOffsetMs(firstPass, formatter);
};

/**
 * Parse a DTSTART / DTEND / EXDATE value. Returns `null` when the value is not
 * a date at all, so a malformed line drops its event instead of the whole feed.
 */
export const parseIcalDate = (
  value: string,
  params: Record<string, string> = {},
): IcalDate | null => {
  const match = DATE_TIME_PATTERN.exec(value.trim());
  if (!match) return null;

  const [, year, month, day, hour, minute, second, utcMarker] = match;
  const parts = {
    year: Number(year),
    month: Number(month) - 1,
    day: Number(day),
    hour: Number(hour ?? 0),
    minute: Number(minute ?? 0),
    second: Number(second ?? 0),
  };

  // A whole-day value has no clock time; anchoring it at local midnight is what
  // makes it land on the right calendar square for the reader.
  if (hour === undefined) {
    return {
      date: new Date(parts.year, parts.month, parts.day),
      allDay: true,
    };
  }

  if (utcMarker) {
    return {
      date: new Date(
        Date.UTC(
          parts.year,
          parts.month,
          parts.day,
          parts.hour,
          parts.minute,
          parts.second,
        ),
      ),
      allDay: false,
    };
  }

  const timeZone = params.TZID;
  if (timeZone) {
    const instant = wallClockToUtc(
      Date.UTC(
        parts.year,
        parts.month,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
      ),
      timeZone,
    );
    if (!Number.isNaN(instant))
      return { date: new Date(instant), allDay: false };
    // Zone we cannot resolve: fall through and read it as floating local time,
    // which is at worst a few hours off rather than a dropped event.
  }

  return {
    date: new Date(
      parts.year,
      parts.month,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ),
    allDay: false,
  };
};

/** Parse a DURATION value (`PT1H30M`, `P2D`) into milliseconds. */
export const parseIcalDuration = (value: string): number | null => {
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) return null;

  const [, sign, weeks, days, hours, minutes, seconds] = match;
  const total =
    Number(weeks ?? 0) * WEEK_MS +
    Number(days ?? 0) * DAY_MS +
    Number(hours ?? 0) * HOUR_MS +
    Number(minutes ?? 0) * MINUTE_MS +
    Number(seconds ?? 0) * SECOND_MS;

  return sign === "-" ? -total : total;
};
