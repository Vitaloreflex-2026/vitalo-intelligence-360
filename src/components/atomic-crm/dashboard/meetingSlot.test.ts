import { describe, expect, it } from "vitest";

import { meetingSlotFromSelection } from "./meetingSlot";

const minutesBetween = (start: Date, end: Date): number =>
  (end.getTime() - start.getTime()) / 60000;

describe("meetingSlotFromSelection", () => {
  it("keeps the exact range drawn on the week grid", () => {
    // Arrange
    const start = new Date(2026, 8, 16, 14, 30);
    const end = new Date(2026, 8, 16, 16, 0);

    // Act
    const slot = meetingSlotFromSelection(start, end, false);

    // Assert
    expect(slot.start).toBe(start);
    expect(slot.end).toBe(end);
  });

  it("turns a day picked in the month view into a morning meeting", () => {
    // Arrange — the month view hands over midnight to midnight.
    const start = new Date(2026, 8, 16, 0, 0);
    const end = new Date(2026, 8, 17, 0, 0);

    // Act
    const slot = meetingSlotFromSelection(start, end, true);

    // Assert
    expect(slot.start.getDate()).toBe(16);
    expect(slot.start.getHours()).toBe(9);
    expect(slot.start.getMinutes()).toBe(0);
  });

  it("never prefills a whole-day meeting from the month view", () => {
    // Arrange
    const start = new Date(2026, 8, 16, 0, 0);
    const end = new Date(2026, 8, 17, 0, 0);

    // Act
    const slot = meetingSlotFromSelection(start, end, true);

    // Assert — the raw selection would be 1440 minutes.
    expect(minutesBetween(slot.start, slot.end)).toBe(60);
  });

  it("does not mutate the date the calendar handed over", () => {
    // Arrange
    const start = new Date(2026, 8, 16, 0, 0);
    const end = new Date(2026, 8, 17, 0, 0);

    // Act
    meetingSlotFromSelection(start, end, true);

    // Assert
    expect(start.getHours()).toBe(0);
  });
});
