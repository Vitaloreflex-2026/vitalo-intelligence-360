/**
 * Recurrence expansion (RFC 5545 §3.8.5.3), scoped to the calendar's visible
 * range.
 *
 * A published feed states a series once, as a rule, and the reader is expected
 * to work out the occurrences. Only the shapes calendars actually emit for
 * meetings are supported — FREQ with INTERVAL / COUNT / UNTIL, BYDAY for weekly
 * and monthly rules, BYMONTHDAY for monthly ones — plus EXDATE and the
 * RECURRENCE-ID override that moves a single occurrence. Anything else
 * (BYSETPOS, BYWEEKNO, BYYEARDAY…) falls back to the rule's plain period, which
 * shows the series at roughly the right time rather than not at all.
 */

import { parseIcalDate } from "./icalDate";
import type { IcalEvent } from "./parseIcalendar";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/** Guard against a malformed or unbounded rule pinning the browser. */
const MAX_PERIODS = 2000;
const MAX_OCCURRENCES = 1000;

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

export type CalendarWindow = { start: Date; end: Date };

/** One dated instance of a feed event, ready to be shown. */
export type IcalOccurrence = {
  /** Unique per instance: a series repeats its UID across occurrences. */
  id: string;
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  allDay: boolean;
};

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

type RecurrenceRule = {
  frequency: Frequency;
  interval: number;
  count: number | null;
  until: Date | null;
  /** `MO`, `TU`… optionally ordinal-prefixed for monthly rules (`2TU`, `-1FR`). */
  byDay: string[];
  byMonthDay: number[];
  weekStart: string;
};

const isFrequency = (value: string): value is Frequency =>
  value === "DAILY" ||
  value === "WEEKLY" ||
  value === "MONTHLY" ||
  value === "YEARLY";

/** Parse `FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20260401T000000Z`. */
export const parseRecurrenceRule = (raw: string): RecurrenceRule | null => {
  const parts = new Map<string, string>();
  raw.split(";").forEach((piece) => {
    const equals = piece.indexOf("=");
    if (equals > 0) {
      parts.set(
        piece.slice(0, equals).toUpperCase(),
        piece.slice(equals + 1).toUpperCase(),
      );
    }
  });

  const frequency = parts.get("FREQ");
  if (!frequency || !isFrequency(frequency)) return null;

  const until = parts.get("UNTIL");
  const count = Number(parts.get("COUNT"));
  const interval = Number(parts.get("INTERVAL"));

  return {
    frequency,
    interval: Number.isFinite(interval) && interval > 0 ? interval : 1,
    count: Number.isFinite(count) && count > 0 ? count : null,
    until: until ? (parseIcalDate(until)?.date ?? null) : null,
    byDay: parts.get("BYDAY")?.split(",").filter(Boolean) ?? [],
    byMonthDay:
      parts
        .get("BYMONTHDAY")
        ?.split(",")
        .map(Number)
        .filter((day) => Number.isInteger(day) && day !== 0) ?? [],
    weekStart: parts.get("WKST") ?? "MO",
  };
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * Add whole months, keeping the day of month. Returns `null` when the target
 * month has no such day (31 February), which the spec says to skip rather than
 * roll over into the next month.
 */
const withMonthAndDay = (
  reference: Date,
  monthOffset: number,
  dayOfMonth: number,
): Date | null => {
  const year = reference.getFullYear();
  const month = reference.getMonth() + monthOffset;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = dayOfMonth < 0 ? daysInMonth + dayOfMonth + 1 : dayOfMonth;
  if (day < 1 || day > daysInMonth) return null;

  return new Date(
    year,
    month,
    day,
    reference.getHours(),
    reference.getMinutes(),
    reference.getSeconds(),
  );
};

/** The date of the `ordinal`-th `weekday` of that month (`-1` meaning last). */
const nthWeekdayOfMonth = (
  reference: Date,
  monthOffset: number,
  weekdayIndex: number,
  ordinal: number,
): Date | null => {
  const year = reference.getFullYear();
  const month = reference.getMonth() + monthOffset;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const matching: number[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (new Date(year, month, day).getDay() === weekdayIndex)
      matching.push(day);
  }

  const day = ordinal > 0 ? matching[ordinal - 1] : matching.at(ordinal);
  if (day == null) return null;

  return new Date(
    year,
    month,
    day,
    reference.getHours(),
    reference.getMinutes(),
    reference.getSeconds(),
  );
};

/** Split `2TU` / `-1FR` / `WE` into its ordinal and weekday index. */
const parseByDay = (
  token: string,
): { ordinal: number | null; weekdayIndex: number } | null => {
  const match = /^([+-]?\d+)?([A-Z]{2})$/.exec(token);
  if (!match) return null;
  const weekdayIndex = WEEKDAYS.indexOf(match[2] as (typeof WEEKDAYS)[number]);
  if (weekdayIndex < 0) return null;
  return {
    ordinal: match[1] ? Number(match[1]) : null,
    weekdayIndex,
  };
};

/** Starts generated by one period of the rule, ascending. */
const periodOccurrences = (
  rule: RecurrenceRule,
  seriesStart: Date,
  period: number,
): Date[] => {
  if (rule.frequency === "DAILY") {
    return [addDays(seriesStart, period * rule.interval)];
  }

  if (rule.frequency === "WEEKLY") {
    const weekStartIndex = Math.max(
      0,
      WEEKDAYS.indexOf(rule.weekStart as (typeof WEEKDAYS)[number]),
    );
    const daysFromWeekStart = (seriesStart.getDay() - weekStartIndex + 7) % 7;
    const weekAnchor = addDays(
      seriesStart,
      period * rule.interval * 7 - daysFromWeekStart,
    );

    const days = rule.byDay.length
      ? rule.byDay
      : [WEEKDAYS[seriesStart.getDay()]];

    return days
      .map((token) => parseByDay(token))
      .filter(
        (parsed): parsed is { ordinal: number | null; weekdayIndex: number } =>
          parsed != null,
      )
      .map((parsed) =>
        addDays(weekAnchor, (parsed.weekdayIndex - weekStartIndex + 7) % 7),
      )
      .sort((left, right) => left.getTime() - right.getTime());
  }

  const monthOffset =
    rule.frequency === "MONTHLY"
      ? period * rule.interval
      : period * rule.interval * 12;

  if (rule.frequency === "MONTHLY" && rule.byDay.length) {
    return rule.byDay
      .map((token) => parseByDay(token))
      .map((parsed) =>
        parsed
          ? nthWeekdayOfMonth(
              seriesStart,
              monthOffset,
              parsed.weekdayIndex,
              parsed.ordinal ?? 1,
            )
          : null,
      )
      .filter((date): date is Date => date != null)
      .sort((left, right) => left.getTime() - right.getTime());
  }

  const days = rule.byMonthDay.length
    ? rule.byMonthDay
    : [seriesStart.getDate()];

  return days
    .map((day) => withMonthAndDay(seriesStart, monthOffset, day))
    .filter((date): date is Date => date != null)
    .sort((left, right) => left.getTime() - right.getTime());
};

/**
 * Periods to skip so the walk starts just before the window instead of at a
 * DTSTART that may be years back. Only safe when the rule has no COUNT, since
 * COUNT is measured from the first occurrence.
 */
const periodsToSkip = (
  rule: RecurrenceRule,
  seriesStart: Date,
  windowStart: Date,
): number => {
  if (rule.count != null) return 0;

  const elapsed = windowStart.getTime() - seriesStart.getTime();
  if (elapsed <= 0) return 0;

  const periods =
    rule.frequency === "DAILY"
      ? elapsed / DAY_MS
      : rule.frequency === "WEEKLY"
        ? elapsed / WEEK_MS
        : rule.frequency === "MONTHLY"
          ? (windowStart.getFullYear() - seriesStart.getFullYear()) * 12 +
            windowStart.getMonth() -
            seriesStart.getMonth()
          : windowStart.getFullYear() - seriesStart.getFullYear();

  // One period of margin: an occurrence started in the previous period may
  // still be running when the window opens.
  return Math.max(0, Math.floor(periods / rule.interval) - 1);
};

const overlaps = (start: Date, end: Date, window: CalendarWindow): boolean =>
  end.getTime() > window.start.getTime() &&
  start.getTime() < window.end.getTime();

const toOccurrence = (event: IcalEvent, start: Date, durationMs: number) => ({
  id: `${event.uid}#${start.getTime()}`,
  uid: event.uid,
  summary: event.summary,
  start,
  end: new Date(start.getTime() + durationMs),
  allDay: event.allDay,
});

const expandSeries = (
  event: IcalEvent,
  rule: RecurrenceRule,
  window: CalendarWindow,
  excluded: Set<number>,
): IcalOccurrence[] => {
  const durationMs = event.end.getTime() - event.start.getTime();
  const occurrences: IcalOccurrence[] = [];
  const skipped = periodsToSkip(rule, event.start, window.start);
  // `skipped` is only ever non-zero for a rule without COUNT, so the counter
  // still starts at the series' first occurrence whenever COUNT is in play.
  let emitted = 0;

  for (let period = skipped; period < skipped + MAX_PERIODS; period += 1) {
    if (rule.count != null && emitted >= rule.count) break;
    if (occurrences.length >= MAX_OCCURRENCES) break;

    const starts = periodOccurrences(rule, event.start, period);
    // A period entirely past the window ends the walk; the rule only moves
    // forward, so nothing later can come back into view.
    if (starts.length && starts[0].getTime() >= window.end.getTime()) break;

    for (const start of starts) {
      if (start.getTime() < event.start.getTime()) continue;
      if (rule.until && start.getTime() > rule.until.getTime())
        return occurrences;
      if (rule.count != null && emitted >= rule.count) return occurrences;
      emitted += 1;

      if (excluded.has(start.getTime())) continue;
      const end = new Date(start.getTime() + durationMs);
      if (overlaps(start, end, window)) {
        occurrences.push(toOccurrence(event, start, durationMs));
      }
    }
  }

  return occurrences;
};

/**
 * Every occurrence of the feed's events that touches the visible range, with
 * recurrences expanded and single-occurrence overrides applied.
 */
export const expandIcalEvents = (
  events: IcalEvent[],
  window: CalendarWindow,
): IcalOccurrence[] => {
  const overridesByUid = new Map<string, IcalEvent[]>();
  events
    .filter((event) => event.recurrenceId != null)
    .forEach((event) => {
      overridesByUid.set(event.uid, [
        ...(overridesByUid.get(event.uid) ?? []),
        event,
      ]);
    });

  const occurrences: IcalOccurrence[] = [];

  events
    .filter((event) => event.recurrenceId == null)
    .forEach((event) => {
      const durationMs = event.end.getTime() - event.start.getTime();

      if (!event.recurrenceRule) {
        if (overlaps(event.start, event.end, window)) {
          occurrences.push(toOccurrence(event, event.start, durationMs));
        }
        return;
      }

      const rule = parseRecurrenceRule(event.recurrenceRule);
      if (!rule) {
        if (overlaps(event.start, event.end, window)) {
          occurrences.push(toOccurrence(event, event.start, durationMs));
        }
        return;
      }

      // A moved occurrence is replaced, not duplicated: drop the slot the
      // series would have generated for it.
      const excluded = new Set([
        ...event.exceptionDates,
        ...(overridesByUid.get(event.uid) ?? []).map(
          (override) => override.recurrenceId as number,
        ),
      ]);

      occurrences.push(...expandSeries(event, rule, window, excluded));
    });

  // The overrides themselves are ordinary dated events.
  [...overridesByUid.values()].flat().forEach((override) => {
    if (overlaps(override.start, override.end, window)) {
      occurrences.push(
        toOccurrence(
          override,
          override.start,
          override.end.getTime() - override.start.getTime(),
        ),
      );
    }
  });

  return occurrences.sort(
    (left, right) => left.start.getTime() - right.start.getTime(),
  );
};
