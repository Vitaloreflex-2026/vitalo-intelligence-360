/**
 * A minimal iCalendar (RFC 5545) reader: enough of the format to turn a
 * published `.ics` feed into busy blocks, and nothing more.
 *
 * Only VEVENT is read — VTODO, VJOURNAL, VALARM and VFREEBUSY carry nothing the
 * calendar overlay shows. Recurrence is kept as the raw RRULE string here and
 * expanded later, because expansion needs the visible range and this step does
 * not have it.
 */

import { parseIcalDate, parseIcalDuration } from "./icalDate";

const DAY_MS = 24 * 60 * 60 * 1000;

/** One VEVENT of the feed, before recurrence is expanded. */
export type IcalEvent = {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  allDay: boolean;
  /** Raw RRULE value; `null` for a one-off event. */
  recurrenceRule: string | null;
  /** EXDATE instants (epoch ms) dropped from the expansion. */
  exceptionDates: number[];
  /**
   * RECURRENCE-ID (epoch ms): this VEVENT replaces the single occurrence of its
   * series that started then — a meeting moved for one week only.
   */
  recurrenceId: number | null;
};

type ContentLine = {
  name: string;
  params: Record<string, string>;
  value: string;
};

/**
 * Undo RFC 5545 line folding: a CRLF followed by one space or tab is a
 * continuation, not a new line. Feeds fold aggressively at 75 octets, so almost
 * every real SUMMARY arrives split.
 */
const unfold = (raw: string): string[] =>
  raw
    .replace(/\r\n[ \t]/g, "")
    .replace(/\n[ \t]/g, "")
    .split(/\r\n|\n|\r/);

/** Split on the first unquoted separator: params may quote one inside a value. */
const splitUnquoted = (input: string, separator: string): string[] => {
  const pieces: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of input) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === separator && !inQuotes) {
      pieces.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  pieces.push(current);
  return pieces;
};

const parseContentLine = (line: string): ContentLine | null => {
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') inQuotes = !inQuotes;
    if (char !== ":" || inQuotes) continue;

    const [name, ...rawParams] = splitUnquoted(line.slice(0, index), ";");
    const params: Record<string, string> = {};
    rawParams.forEach((param) => {
      const equals = param.indexOf("=");
      if (equals > 0) {
        params[param.slice(0, equals).toUpperCase()] = param.slice(equals + 1);
      }
    });

    return {
      name: name.toUpperCase(),
      params,
      value: line.slice(index + 1),
    };
  }
  return null;
};

/** RFC 5545 §3.3.11 TEXT escaping. */
const unescapeText = (value: string): string =>
  value
    .replace(/\\[nN]/g, "\n")
    .replace(/\\([,;\\])/g, "$1")
    .trim();

/**
 * When a VEVENT gives no end, the spec fixes one: a whole-day event lasts a
 * day, a timed one ends where it started.
 */
const impliedEnd = (start: Date, allDay: boolean): Date =>
  allDay ? new Date(start.getTime() + DAY_MS) : new Date(start.getTime());

const toEvent = (lines: ContentLine[]): IcalEvent | null => {
  const first = (name: string): ContentLine | undefined =>
    lines.find((line) => line.name === name);

  const dtStart = first("DTSTART");
  if (!dtStart) return null;

  const start = parseIcalDate(dtStart.value, dtStart.params);
  if (!start) return null;

  // A cancelled occurrence and time explicitly marked as free are both "not
  // busy", which is the only thing this overlay claims to show.
  const status = first("STATUS")?.value.toUpperCase();
  const transparency = first("TRANSP")?.value.toUpperCase();
  if (status === "CANCELLED" || transparency === "TRANSPARENT") return null;

  const dtEnd = first("DTEND");
  const duration = first("DURATION");
  const parsedEnd = dtEnd ? parseIcalDate(dtEnd.value, dtEnd.params) : null;
  const durationMs = duration ? parseIcalDuration(duration.value) : null;

  const end =
    parsedEnd?.date ??
    (durationMs != null
      ? new Date(start.date.getTime() + durationMs)
      : impliedEnd(start.date, start.allDay));

  const recurrenceIdLine = first("RECURRENCE-ID");
  const recurrenceId = recurrenceIdLine
    ? (parseIcalDate(
        recurrenceIdLine.value,
        recurrenceIdLine.params,
      )?.date.getTime() ?? null)
    : null;

  // EXDATE may repeat and may list several comma-separated dates per line.
  const exceptionDates = lines
    .filter((line) => line.name === "EXDATE")
    .flatMap((line) =>
      line.value
        .split(",")
        .map((value) => parseIcalDate(value, line.params)?.date.getTime())
        .filter((time): time is number => time != null),
    );

  return {
    uid: first("UID")?.value ?? `${start.date.getTime()}`,
    summary: unescapeText(first("SUMMARY")?.value ?? ""),
    start: start.date,
    end:
      end.getTime() > start.date.getTime()
        ? end
        : impliedEnd(start.date, start.allDay),
    allDay: start.allDay,
    recurrenceRule: first("RRULE")?.value ?? null,
    exceptionDates,
    recurrenceId,
  };
};

/**
 * Every usable VEVENT of an iCalendar stream. Unreadable events are skipped
 * rather than thrown on: one bad line in a third-party feed must not blank the
 * whole calendar.
 */
export const parseIcalendar = (raw: string): IcalEvent[] => {
  const events: IcalEvent[] = [];
  let current: ContentLine[] | null = null;
  // A VEVENT usually wraps a VALARM, whose own DURATION would otherwise be read
  // as the meeting's length. Anything nested is skipped wholesale.
  let nestedDepth = 0;

  for (const line of unfold(raw)) {
    const parsed = parseContentLine(line);
    if (!parsed) continue;

    if (parsed.name === "BEGIN") {
      if (parsed.value.toUpperCase() === "VEVENT" && !current) {
        current = [];
      } else if (current) {
        nestedDepth += 1;
      }
      continue;
    }

    if (parsed.name === "END") {
      if (nestedDepth > 0) {
        nestedDepth -= 1;
      } else if (parsed.value.toUpperCase() === "VEVENT" && current) {
        const event = toEvent(current);
        if (event) events.push(event);
        current = null;
      }
      continue;
    }

    if (current && nestedDepth === 0) current.push(parsed);
  }

  return events;
};
