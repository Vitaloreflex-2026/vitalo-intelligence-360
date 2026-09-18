import type { UpdateParams } from "ra-core";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper, buildContact, buildSale } from "@/test/StoryWrapper";
import type { Sale, Task } from "../types";
import { MeetingsCalendar } from "./MeetingsCalendar";

const RESCHEDULE_ERROR = "This meeting could not be moved";
const FEED_ERROR =
  "An external calendar could not be read. Check its address in your profile.";

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

const renderCalendar = (
  dataProvider?: Parameters<typeof StoryWrapper>[0]["dataProvider"],
) =>
  render(
    <StoryWrapper
      data={{
        contacts: [buildContact()],
        sales: buildTeam(),
        tasks: buildMeetings(),
      }}
      dataProvider={dataProvider}
    >
      <MeetingsCalendar />
    </StoryWrapper>,
  );

/**
 * ra-data-postgrest only sends the fields that differ from `previousData`, so it
 * reads that record on every update and an omitted one throws. FakeRest accepts
 * the call either way, which would hide the bug, so stand in for the real
 * provider here.
 */
const diffingUpdate =
  (saved: UpdateParams[]) =>
  async (_resource: string, params: UpdateParams) => {
    const changes = Object.fromEntries(
      Object.entries(params.data).filter(
        ([field, value]) => value !== params.previousData[field],
      ),
    );
    saved.push(params);
    return { data: { ...params.previousData, ...changes } };
  };

/** `YYYYMMDDTHHMMSS` in local time, the zone-less form an .ics may carry. */
const icsStamp = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}00`
  );
};

/** A one-event feed at the given hour today, as a published calendar sends it. */
const buildFeed = (summary: string, hour: number): string => {
  const start = new Date();
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Test//EN",
    "BEGIN:VEVENT",
    "UID:external-1@example.com",
    `SUMMARY:${summary}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

/** The same time of day as the given meeting block, one day column further. */
const neighbouringDaySlot = (title: string) => {
  const source = [
    ...document.querySelectorAll<HTMLElement>(".fc-timegrid-event"),
  ].find((element) => element.textContent?.includes(title));
  if (!source) throw new Error(`No calendar block for "${title}"`);
  source.scrollIntoView({ block: "center" });

  const columns = [
    ...document.querySelectorAll<HTMLElement>(".fc-timegrid-col[data-date]"),
  ];
  const index = columns.indexOf(source.closest(".fc-timegrid-col")!);
  const column = columns[index + 1] ?? columns[index - 1];

  const { top, height } = source.getBoundingClientRect();
  const { left, width } = column.getBoundingClientRect();
  const target = document.elementFromPoint(left + width / 2, top + height / 2);
  if (!target) throw new Error("No drop target next to the meeting");
  return { source, target };
};

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

  it("shows the user's external calendars as busy blocks", async () => {
    // Arrange & Act
    const screen = await renderCalendar({
      getIcalFeeds: async () => ({
        feeds: [{ ics: buildFeed("Dentiste", 16) }],
      }),
    });

    // Assert
    await expect.element(screen.getByText("Dentiste")).toBeVisible();
    await expect
      .element(screen.getByText("External calendars", { exact: true }))
      .toBeVisible();
  });

  it("merges the blocks of every configured calendar", async () => {
    // Arrange & Act
    const screen = await renderCalendar({
      getIcalFeeds: async () => ({
        feeds: [
          { ics: buildFeed("Dentiste", 16) },
          { ics: buildFeed("Cours de piano", 18) },
        ],
      }),
    });

    // Assert
    await expect.element(screen.getByText("Dentiste")).toBeVisible();
    await expect.element(screen.getByText("Cours de piano")).toBeVisible();
  });

  it("still draws the calendars that answered when one of them fails", async () => {
    // Arrange & Act
    const screen = await renderCalendar({
      getIcalFeeds: async () => ({
        feeds: [{ ics: buildFeed("Dentiste", 16) }, { error: "404" }],
      }),
    });

    // Assert — the working calendar is drawn, and the broken one is reported.
    await expect.element(screen.getByText("Dentiste")).toBeVisible();
    await expect.element(screen.getByText(FEED_ERROR)).toBeVisible();
  });

  it("does not let an external block be dragged or edited", async () => {
    // Arrange
    const saved: UpdateParams[] = [];
    const screen = await renderCalendar({
      getIcalFeeds: async () => ({
        feeds: [{ ics: buildFeed("Dentiste", 16) }],
      }),
      update: diffingUpdate(saved),
    });
    const block = screen.getByText("Dentiste");
    await expect.element(block).toBeVisible();

    // Act — a click opens the edit dialog for a CRM meeting.
    await block.click();

    // Assert — nothing to edit, and nothing written back to the feed's source.
    expect(screen.getByRole("dialog").elements()).toHaveLength(0);
    expect(saved).toHaveLength(0);
  });

  it("hides the external calendars when the user unchecks them", async () => {
    // Arrange
    const screen = await renderCalendar({
      getIcalFeeds: async () => ({
        feeds: [{ ics: buildFeed("Dentiste", 16) }],
      }),
    });
    await expect.element(screen.getByText("Dentiste")).toBeVisible();

    // Act
    await screen.getByLabelText("My external calendars").click();

    // Assert
    await expect
      .poll(() => screen.getByText("Dentiste").elements())
      .toHaveLength(0);
  });

  it("says so when an external calendar cannot be read", async () => {
    // Arrange & Act
    const screen = await renderCalendar({
      getIcalFeeds: async () => ({
        feeds: [{ error: "This calendar URL points to a private address" }],
      }),
    });

    // Assert
    await expect.element(screen.getByText(FEED_ERROR)).toBeVisible();
  });

  it("saves the new slot when a meeting is dragged to another day", async () => {
    // Arrange
    const [meeting] = buildMeetings();
    const saved: UpdateParams[] = [];
    const screen = await renderCalendar({ update: diffingUpdate(saved) });
    await expect.element(screen.getByText(meeting.text)).toBeVisible();

    // Act
    const { source, target } = neighbouringDaySlot(meeting.text);
    await userEvent.dragAndDrop(source, target);

    // Assert
    await expect.poll(() => saved.length).toBe(1);
    expect(saved[0].data.due_date).not.toBe(meeting.due_date);
    expect(screen.getByText(RESCHEDULE_ERROR).elements()).toHaveLength(0);
  });
});
