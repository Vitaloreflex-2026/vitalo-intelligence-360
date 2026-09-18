import { describe, expect, it } from "vitest";

import { parseIcalendar } from "./parseIcalendar";

/** Wrap VEVENT bodies in the envelope a real feed carries, with CRLF endings. */
const feed = (...events: string[]): string =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Test//EN",
    ...events,
    "END:VCALENDAR",
  ]
    .join("\r\n")
    .concat("\r\n");

const event = (...lines: string[]): string =>
  ["BEGIN:VEVENT", ...lines, "END:VEVENT"].join("\r\n");

describe("parseIcalendar", () => {
  it("reads an event's summary and bounds", () => {
    const [parsed] = parseIcalendar(
      feed(
        event(
          "UID:abc@example.com",
          "SUMMARY:Comité de direction",
          "DTSTART:20260115T090000Z",
          "DTEND:20260115T103000Z",
        ),
      ),
    );

    expect(parsed.uid).toBe("abc@example.com");
    expect(parsed.summary).toBe("Comité de direction");
    expect(parsed.start.toISOString()).toBe("2026-01-15T09:00:00.000Z");
    expect(parsed.end.toISOString()).toBe("2026-01-15T10:30:00.000Z");
  });

  it("rejoins a summary folded across lines", () => {
    const [parsed] = parseIcalendar(
      feed(
        event(
          "UID:folded@example.com",
          "SUMMARY:Point hebdomadaire avec l'équipe ",
          " commerciale",
          "DTSTART:20260115T090000Z",
          "DTEND:20260115T100000Z",
        ),
      ),
    );

    expect(parsed.summary).toBe("Point hebdomadaire avec l'équipe commerciale");
  });

  it("unescapes commas, semicolons and newlines in the summary", () => {
    const [parsed] = parseIcalendar(
      feed(
        event(
          "UID:escaped@example.com",
          "SUMMARY:Acme\\, Globex\\; suite\\nSalle B",
          "DTSTART:20260115T090000Z",
        ),
      ),
    );

    expect(parsed.summary).toBe("Acme, Globex; suite\nSalle B");
  });

  it("derives the end from DURATION when there is no DTEND", () => {
    const [parsed] = parseIcalendar(
      feed(
        event(
          "UID:duration@example.com",
          "DTSTART:20260115T090000Z",
          "DURATION:PT45M",
        ),
      ),
    );

    expect(parsed.end.toISOString()).toBe("2026-01-15T09:45:00.000Z");
  });

  it("ignores a reminder's own duration", () => {
    const [parsed] = parseIcalendar(
      feed(
        [
          "BEGIN:VEVENT",
          "UID:alarm@example.com",
          "DTSTART:20260115T090000Z",
          "DTEND:20260115T100000Z",
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          "TRIGGER:-PT10M",
          "DURATION:PT5M",
          "REPEAT:2",
          "END:VALARM",
          "END:VEVENT",
        ].join("\r\n"),
      ),
    );

    expect(parsed.end.toISOString()).toBe("2026-01-15T10:00:00.000Z");
  });

  it("gives a whole-day event a one-day span", () => {
    const [parsed] = parseIcalendar(
      feed(
        event(
          "UID:offsite@example.com",
          "DTSTART;VALUE=DATE:20260115",
          "DTEND;VALUE=DATE:20260116",
        ),
      ),
    );

    expect(parsed.allDay).toBe(true);
    expect(parsed.end.getTime() - parsed.start.getTime()).toBe(
      24 * 60 * 60 * 1000,
    );
  });

  it("drops cancelled events", () => {
    expect(
      parseIcalendar(
        feed(
          event(
            "UID:cancelled@example.com",
            "STATUS:CANCELLED",
            "DTSTART:20260115T090000Z",
          ),
        ),
      ),
    ).toHaveLength(0);
  });

  it("drops time explicitly marked as free", () => {
    expect(
      parseIcalendar(
        feed(
          event(
            "UID:free@example.com",
            "TRANSP:TRANSPARENT",
            "DTSTART:20260115T090000Z",
          ),
        ),
      ),
    ).toHaveLength(0);
  });

  it("collects every excluded date of a series", () => {
    const [parsed] = parseIcalendar(
      feed(
        event(
          "UID:series@example.com",
          "DTSTART:20260105T090000Z",
          "DTEND:20260105T100000Z",
          "RRULE:FREQ=WEEKLY",
          "EXDATE:20260112T090000Z,20260119T090000Z",
          "EXDATE:20260126T090000Z",
        ),
      ),
    );

    expect(parsed.recurrenceRule).toBe("FREQ=WEEKLY");
    expect(parsed.exceptionDates).toHaveLength(3);
  });

  it("keeps the occurrence a RECURRENCE-ID event replaces", () => {
    const [parsed] = parseIcalendar(
      feed(
        event(
          "UID:series@example.com",
          "RECURRENCE-ID:20260112T090000Z",
          "DTSTART:20260112T140000Z",
          "DTEND:20260112T150000Z",
        ),
      ),
    );

    expect(parsed.recurrenceId).toBe(
      new Date("2026-01-12T09:00:00.000Z").getTime(),
    );
  });

  it("skips an event with no start rather than failing the feed", () => {
    const parsed = parseIcalendar(
      feed(
        event("UID:broken@example.com", "SUMMARY:Sans date"),
        event("UID:ok@example.com", "DTSTART:20260115T090000Z"),
      ),
    );

    expect(parsed.map((item) => item.uid)).toEqual(["ok@example.com"]);
  });

  it("returns nothing for content that is not a calendar", () => {
    expect(parseIcalendar("<html><body>404</body></html>")).toEqual([]);
  });
});
