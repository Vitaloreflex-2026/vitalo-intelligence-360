import { describe, expect, it } from "vitest";

import { expandIcalEvents } from "./expandIcalEvents";
import { parseIcalendar } from "./parseIcalendar";

/**
 * Fixtures use floating (zone-less) stamps so the expected dates can be built
 * with plain local constructors: weekday and month arithmetic happen in local
 * time, and a UTC fixture would drift on a machine far from UTC.
 */
const feed = (...lines: string[]): string =>
  ["BEGIN:VCALENDAR", "VERSION:2.0", ...lines, "END:VCALENDAR"].join("\r\n");

const event = (...lines: string[]): string[] => [
  "BEGIN:VEVENT",
  ...lines,
  "END:VEVENT",
];

const occurrencesOf = (
  ics: string,
  from: Date,
  to: Date,
): { summary: string; start: Date }[] =>
  expandIcalEvents(parseIcalendar(ics), { start: from, end: to }).map(
    ({ summary, start }) => ({ summary, start }),
  );

/** January 2026: the 1st is a Thursday, the 5th a Monday. */
const JANUARY = new Date(2026, 0, 1);
const FEBRUARY = new Date(2026, 1, 1);

describe("expandIcalEvents", () => {
  it("keeps a one-off event that touches the window", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:one-off",
          "SUMMARY:Revue annuelle",
          "DTSTART:20260115T090000",
          "DTEND:20260115T100000",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].start).toEqual(new Date(2026, 0, 15, 9));
  });

  it("drops an event that ends before the window opens", () => {
    expect(
      occurrencesOf(
        feed(
          ...event(
            "UID:past",
            "DTSTART:20251215T090000",
            "DTEND:20251215T100000",
          ),
        ),
        JANUARY,
        FEBRUARY,
      ),
    ).toHaveLength(0);
  });

  it("keeps an event already running when the window opens", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:overlapping",
          "DTSTART;VALUE=DATE:20251228",
          "DTEND;VALUE=DATE:20260105",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences).toHaveLength(1);
  });

  it("repeats a weekly series on each of its days", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:weekly",
          "SUMMARY:Daily",
          "DTSTART:20260105T090000",
          "DTEND:20260105T093000",
          "RRULE:FREQ=WEEKLY;BYDAY=MO,WE",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences.map((item) => item.start)).toEqual([
      new Date(2026, 0, 5, 9),
      new Date(2026, 0, 7, 9),
      new Date(2026, 0, 12, 9),
      new Date(2026, 0, 14, 9),
      new Date(2026, 0, 19, 9),
      new Date(2026, 0, 21, 9),
      new Date(2026, 0, 26, 9),
      new Date(2026, 0, 28, 9),
    ]);
  });

  it("honours INTERVAL on a weekly series", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:fortnightly",
          "DTSTART:20260105T090000",
          "DTEND:20260105T100000",
          "RRULE:FREQ=WEEKLY;INTERVAL=2",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences.map((item) => item.start)).toEqual([
      new Date(2026, 0, 5, 9),
      new Date(2026, 0, 19, 9),
    ]);
  });

  it("stops a series at its COUNT", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:counted",
          "DTSTART:20260105T090000",
          "DTEND:20260105T100000",
          "RRULE:FREQ=WEEKLY;COUNT=2",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences).toHaveLength(2);
  });

  it("stops a series at its UNTIL date", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:until",
          "DTSTART:20260105T090000",
          "DTEND:20260105T100000",
          "RRULE:FREQ=DAILY;UNTIL=20260108T000000",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences.map((item) => item.start)).toEqual([
      new Date(2026, 0, 5, 9),
      new Date(2026, 0, 6, 9),
      new Date(2026, 0, 7, 9),
    ]);
  });

  it("leaves out the dates a series excludes", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:with-exdate",
          "DTSTART:20260105T090000",
          "DTEND:20260105T100000",
          "RRULE:FREQ=WEEKLY",
          "EXDATE:20260112T090000",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences.map((item) => item.start)).toEqual([
      new Date(2026, 0, 5, 9),
      new Date(2026, 0, 19, 9),
      new Date(2026, 0, 26, 9),
    ]);
  });

  it("shows a moved occurrence at its new time, only once", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:moved",
          "SUMMARY:Comité",
          "DTSTART:20260105T090000",
          "DTEND:20260105T100000",
          "RRULE:FREQ=WEEKLY;COUNT=3",
        ),
        ...event(
          "UID:moved",
          "SUMMARY:Comité (reporté)",
          "RECURRENCE-ID:20260112T090000",
          "DTSTART:20260113T160000",
          "DTEND:20260113T170000",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences).toEqual([
      { summary: "Comité", start: new Date(2026, 0, 5, 9) },
      { summary: "Comité (reporté)", start: new Date(2026, 0, 13, 16) },
      { summary: "Comité", start: new Date(2026, 0, 19, 9) },
    ]);
  });

  it("repeats a monthly series on the same day of the month", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:monthly",
          "DTSTART:20260115T090000",
          "DTEND:20260115T100000",
          "RRULE:FREQ=MONTHLY",
        ),
      ),
      JANUARY,
      new Date(2026, 3, 1),
    );

    expect(occurrences.map((item) => item.start)).toEqual([
      new Date(2026, 0, 15, 9),
      new Date(2026, 1, 15, 9),
      new Date(2026, 2, 15, 9),
    ]);
  });

  it("repeats a monthly series on its nth weekday", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:last-friday",
          "DTSTART:20260130T170000",
          "DTEND:20260130T180000",
          "RRULE:FREQ=MONTHLY;BYDAY=-1FR",
        ),
      ),
      JANUARY,
      new Date(2026, 3, 1),
    );

    expect(occurrences.map((item) => item.start)).toEqual([
      new Date(2026, 0, 30, 17),
      new Date(2026, 1, 27, 17),
      new Date(2026, 2, 27, 17),
    ]);
  });

  it("skips months that have no such day", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:the-31st",
          "DTSTART:20260131T090000",
          "DTEND:20260131T100000",
          "RRULE:FREQ=MONTHLY",
        ),
      ),
      JANUARY,
      new Date(2026, 3, 1),
    );

    expect(occurrences.map((item) => item.start)).toEqual([
      new Date(2026, 0, 31, 9),
      new Date(2026, 2, 31, 9),
    ]);
  });

  it("reaches a window years after an unbounded series started", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:old-daily",
          "DTSTART:20150105T090000",
          "DTEND:20150105T093000",
          "RRULE:FREQ=DAILY",
        ),
      ),
      new Date(2026, 0, 5),
      new Date(2026, 0, 8),
    );

    expect(occurrences.map((item) => item.start)).toEqual([
      new Date(2026, 0, 5, 9),
      new Date(2026, 0, 6, 9),
      new Date(2026, 0, 7, 9),
    ]);
  });

  it("shows a series whose rule it cannot read at its stated start", () => {
    const occurrences = occurrencesOf(
      feed(
        ...event(
          "UID:exotic",
          "DTSTART:20260115T090000",
          "DTEND:20260115T100000",
          "RRULE:FREQ=SECONDLY;BYSETPOS=3",
        ),
      ),
      JANUARY,
      FEBRUARY,
    );

    expect(occurrences).toHaveLength(1);
  });
});
