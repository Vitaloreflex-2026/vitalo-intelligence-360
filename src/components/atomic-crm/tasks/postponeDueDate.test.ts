import { addDays } from "date-fns/addDays";
import { isSameDay } from "date-fns/isSameDay";
import { describe, expect, it } from "vitest";
import {
  DAYS_UNTIL_NEXT_WEEK,
  DAYS_UNTIL_TOMORROW,
  postponeDueDate,
} from "./postponeDueDate";

/** An upcoming date, so the tests are not themselves affected by "today". */
const upcoming = (hours: number, minutes = 0) => {
  const date = addDays(new Date(), 30);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const overdue = (daysAgo: number, hours: number) => {
  const date = addDays(new Date(), -daysAgo);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

describe("postponeDueDate", () => {
  it("moves an upcoming meeting to the next day, at the same time", () => {
    // Arrange
    const dueDate = upcoming(9, 30);

    // Act
    const postponed = new Date(postponeDueDate(dueDate, DAYS_UNTIL_TOMORROW));

    // Assert
    expect(isSameDay(postponed, addDays(new Date(dueDate), 1))).toBe(true);
    expect(postponed.getHours()).toBe(9);
    expect(postponed.getMinutes()).toBe(30);
  });

  it("moves an upcoming meeting one week later", () => {
    // Arrange
    const dueDate = upcoming(14);

    // Act
    const postponed = new Date(postponeDueDate(dueDate, DAYS_UNTIL_NEXT_WEEK));

    // Assert
    expect(isSameDay(postponed, addDays(new Date(dueDate), 7))).toBe(true);
    expect(postponed.getHours()).toBe(14);
  });

  it("reschedules a late meeting from today, not from the day it was missed", () => {
    // Arrange
    const dueDate = overdue(5, 10);

    // Act
    const postponed = new Date(postponeDueDate(dueDate, DAYS_UNTIL_TOMORROW));

    // Assert
    expect(isSameDay(postponed, addDays(new Date(), 1))).toBe(true);
    expect(postponed.getHours()).toBe(10);
  });

  it("reschedules a late meeting to next week relative to today", () => {
    // Arrange
    const dueDate = overdue(3, 16);

    // Act
    const postponed = new Date(postponeDueDate(dueDate, DAYS_UNTIL_NEXT_WEEK));

    // Assert
    expect(isSameDay(postponed, addDays(new Date(), 7))).toBe(true);
    expect(postponed.getHours()).toBe(16);
  });
});
