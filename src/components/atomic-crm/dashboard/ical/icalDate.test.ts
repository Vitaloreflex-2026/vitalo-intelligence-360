import { describe, expect, it } from "vitest";

import { parseIcalDate, parseIcalDuration } from "./icalDate";

describe("parseIcalDate", () => {
  it("reads a UTC stamp as the instant it names", () => {
    expect(parseIcalDate("20260115T090000Z")?.date.toISOString()).toBe(
      "2026-01-15T09:00:00.000Z",
    );
  });

  it("applies the named zone's winter offset", () => {
    expect(
      parseIcalDate("20260115T090000", {
        TZID: "Europe/Paris",
      })?.date.toISOString(),
    ).toBe("2026-01-15T08:00:00.000Z");
  });

  it("applies the named zone's summer offset", () => {
    expect(
      parseIcalDate("20260715T090000", {
        TZID: "Europe/Paris",
      })?.date.toISOString(),
    ).toBe("2026-07-15T07:00:00.000Z");
  });

  it("reads a stamp with no zone as local time", () => {
    const parsed = parseIcalDate("20260115T090000");

    expect(parsed?.allDay).toBe(false);
    expect(parsed?.date.getHours()).toBe(9);
    expect(parsed?.date.getDate()).toBe(15);
  });

  it("falls back to local time when the zone is not a known one", () => {
    const parsed = parseIcalDate("20260115T090000", {
      TZID: "Romance Standard Time",
    });

    expect(parsed?.date.getHours()).toBe(9);
  });

  it("marks a date-only value as whole-day, at local midnight", () => {
    const parsed = parseIcalDate("20260115", { VALUE: "DATE" });

    expect(parsed?.allDay).toBe(true);
    expect(parsed?.date.getHours()).toBe(0);
    expect(parsed?.date.getDate()).toBe(15);
  });

  it("returns null when the value is not a date", () => {
    expect(parseIcalDate("next tuesday")).toBeNull();
  });
});

describe("parseIcalDuration", () => {
  it("adds up hours and minutes", () => {
    expect(parseIcalDuration("PT1H30M")).toBe(90 * 60 * 1000);
  });

  it("reads whole days and weeks", () => {
    expect(parseIcalDuration("P2D")).toBe(2 * 24 * 60 * 60 * 1000);
    expect(parseIcalDuration("P1W")).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("keeps a negative sign", () => {
    expect(parseIcalDuration("-PT15M")).toBe(-15 * 60 * 1000);
  });

  it("returns null for a malformed duration", () => {
    expect(parseIcalDuration("1h")).toBeNull();
  });
});
