import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper, buildContact, buildSale } from "@/test/StoryWrapper";
import type { Sale, Task } from "../types";
import { MeetingsCalendar } from "./MeetingsCalendar";

/** Today at 10:00 local time, so the meeting lands in the visible week. */
const todayAt = (hour: number): string => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const buildTeam = (): Sale[] => [
  buildSale({
    id: 1,
    first_name: "Alice",
    last_name: "Martin",
    color: "#cfe3f7",
  }),
  buildSale({
    id: 2,
    first_name: "Bruno",
    last_name: "Petit",
    color: "#e2d9f3",
  }),
  buildSale({ id: 3, first_name: "Chloé", last_name: "Roux", color: null }),
];

const buildMeetings = (): Task[] => [
  {
    id: 1,
    contact_id: 1,
    sales_id: 1,
    type: "Premier contact",
    text: "Cadrage Acme",
    due_date: todayAt(10),
    duration_minutes: 60,
  },
  {
    id: 2,
    contact_id: 1,
    sales_id: 2,
    type: "Restitution",
    text: "Restitution Globex",
    due_date: todayAt(14),
    duration_minutes: 60,
  },
];

const renderCalendar = () =>
  render(
    <StoryWrapper
      data={{
        contacts: [buildContact()],
        sales: buildTeam(),
        tasks: buildMeetings(),
      }}
    >
      <MeetingsCalendar />
    </StoryWrapper>,
  );

describe("MeetingsCalendar", () => {
  it("shows the meetings of every consultant, not only the current user's", async () => {
    // Arrange & Act
    const screen = await renderCalendar();

    // Assert — the signed-in user is neither of those two consultants.
    await expect.element(screen.getByText("Cadrage Acme")).toBeVisible();
    await expect.element(screen.getByText("Restitution Globex")).toBeVisible();
  });

  it("legends the consultants holding a meeting in the visible range", async () => {
    // Arrange & Act
    const screen = await renderCalendar();

    // Assert
    await expect.element(screen.getByText("Alice Martin")).toBeVisible();
    await expect.element(screen.getByText("Bruno Petit")).toBeVisible();
  });

  it("leaves a consultant with no meeting in range out of the legend", async () => {
    // Arrange & Act
    const screen = await renderCalendar();
    await expect.element(screen.getByText("Alice Martin")).toBeVisible();

    // Assert
    expect(screen.getByText("Chloé Roux").elements()).toHaveLength(0);
  });

  it("fills a meeting block with its consultant's color", async () => {
    // Arrange & Act
    const screen = await renderCalendar();
    await expect.element(screen.getByText("Cadrage Acme")).toBeVisible();

    // Assert — the fill is the only thing telling one consultant from another
    // at a day column's real width, so it has to be the consultant's own.
    const fills = [...document.querySelectorAll<HTMLElement>(".fc-event")].map(
      (event) => event.style.backgroundColor,
    );
    expect(fills).toContain("rgb(207, 227, 247)"); // Alice — #cfe3f7
    expect(fills).toContain("rgb(226, 217, 243)"); // Bruno — #e2d9f3
  });
});
