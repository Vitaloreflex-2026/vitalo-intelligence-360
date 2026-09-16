import { describe, expect, it } from "vitest";

import { calendarScrollTime } from "./calendarScrollTime";

const FIRST_SLOT = "07:00:00";
const LAST_SLOT = "21:00:00";

const at = (hours: number, minutes = 0): Date =>
  new Date(2026, 8, 16, hours, minutes);

describe("calendarScrollTime", () => {
  it("opens an hour before the current time so the meeting in progress stays visible", () => {
    // Arrange
    const now = at(14, 20);

    // Act
    const scrollTime = calendarScrollTime(now, FIRST_SLOT, LAST_SLOT);

    // Assert
    expect(scrollTime).toBe("13:00:00");
  });

  it("lands on a whole hour whatever the current minute", () => {
    // Arrange & Act
    const onTheHour = calendarScrollTime(at(15, 0), FIRST_SLOT, LAST_SLOT);
    const lateInTheHour = calendarScrollTime(at(15, 59), FIRST_SLOT, LAST_SLOT);

    // Assert
    expect(onTheHour).toBe("14:00:00");
    expect(lateInTheHour).toBe("14:00:00");
  });

  it("does not scroll above the first slot early in the morning", () => {
    // Arrange
    const now = at(7, 30);

    // Act
    const scrollTime = calendarScrollTime(now, FIRST_SLOT, LAST_SLOT);

    // Assert
    expect(scrollTime).toBe(FIRST_SLOT);
  });

  it("stays on the first slot before the grid even opens", () => {
    // Arrange
    const now = at(3, 15);

    // Act
    const scrollTime = calendarScrollTime(now, FIRST_SLOT, LAST_SLOT);

    // Assert
    expect(scrollTime).toBe(FIRST_SLOT);
  });

  it("does not scroll past the last slot late at night", () => {
    // Arrange
    const now = at(23, 45);

    // Act
    const scrollTime = calendarScrollTime(now, FIRST_SLOT, LAST_SLOT);

    // Assert
    expect(scrollTime).toBe(LAST_SLOT);
  });

  it("shows the end of the working day during the last hour", () => {
    // Arrange
    const now = at(20, 30);

    // Act
    const scrollTime = calendarScrollTime(now, FIRST_SLOT, LAST_SLOT);

    // Assert
    expect(scrollTime).toBe("19:00:00");
  });
});
