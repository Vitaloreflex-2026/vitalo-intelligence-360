import { describe, expect, it } from "vitest";

import { meetingDurationMinutes, meetingEndTime } from "./meetingEndTime";

/** Built in local time, as the form inputs are, so any timezone passes. */
const startAt = (hours: number, minutes: number, seconds = 0): string =>
  new Date(2026, 2, 6, hours, minutes, seconds).toISOString();

describe("meetingEndTime", () => {
  it("returns the local time at which the meeting ends", () => {
    expect(meetingEndTime(startAt(14, 0), 90)).toBe("15:30");
  });

  it("falls back to a one-hour meeting when no length is stored", () => {
    expect(meetingEndTime(startAt(9, 15))).toBe("10:15");
  });

  it("returns an empty time when the meeting has no start", () => {
    expect(meetingEndTime(null, 60)).toBe("");
  });
});

describe("meetingDurationMinutes", () => {
  it("returns the minutes between the start and an end time the same day", () => {
    expect(meetingDurationMinutes(startAt(14, 0), "15:30")).toBe(90);
  });

  it("returns a negative length when the end time comes before the start", () => {
    expect(meetingDurationMinutes(startAt(14, 0), "13:00")).toBe(-60);
  });

  it("gives back the picked end time when the start carries seconds", () => {
    const start = startAt(14, 3, 40);

    const duration = meetingDurationMinutes(start, "15:00");

    expect(meetingEndTime(start, duration)).toBe("15:00");
  });

  it("returns undefined when the end time is incomplete", () => {
    expect(meetingDurationMinutes(startAt(14, 0), "")).toBeUndefined();
  });

  it("returns undefined when the meeting has no start", () => {
    expect(meetingDurationMinutes(null, "15:00")).toBeUndefined();
  });
});
