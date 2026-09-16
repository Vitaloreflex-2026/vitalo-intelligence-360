import { describe, expect, it } from "vitest";
import {
  DAYS_UNTIL_NEXT_WEEK,
  DAYS_UNTIL_TOMORROW,
  postponeDueDate,
} from "./postponeDueDate";

describe("postponeDueDate", () => {
  it("moves the due date to the next day", () => {
    // Arrange
    const dueDate = "2025-03-06T09:30:00.000Z";

    // Act
    const postponed = postponeDueDate(dueDate, DAYS_UNTIL_TOMORROW);

    // Assert
    expect(postponed).toBe("2025-03-07T09:30:00.000Z");
  });

  it("moves the due date one week later", () => {
    // Arrange
    const dueDate = "2025-03-06T09:30:00.000Z";

    // Act
    const postponed = postponeDueDate(dueDate, DAYS_UNTIL_NEXT_WEEK);

    // Assert
    expect(postponed).toBe("2025-03-13T09:30:00.000Z");
  });

  it("keeps the time of day when crossing a month boundary", () => {
    // Arrange
    const dueDate = "2025-01-31T14:15:00.000Z";

    // Act
    const postponed = postponeDueDate(dueDate, DAYS_UNTIL_TOMORROW);

    // Assert
    expect(postponed).toBe("2025-02-01T14:15:00.000Z");
  });
});
