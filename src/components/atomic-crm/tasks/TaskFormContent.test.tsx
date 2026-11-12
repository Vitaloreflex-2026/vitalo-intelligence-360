import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper, buildContact } from "@/test/StoryWrapper";
import type { Task } from "../types";
import { TaskEdit } from "./TaskEdit";

/** 14:00 local time: the form shows and takes local times. */
const MEETING_START = new Date(2026, 2, 6, 14, 0).toISOString();

const meeting: Task = {
  id: 1,
  contact_id: 1,
  sales_id: 0,
  type: "Premier contact",
  text: "Cadrage Acme",
  due_date: MEETING_START,
  duration_minutes: 90,
};

const renderMeetingForm = async () => {
  const screen = await render(
    <StoryWrapper data={{ contacts: [buildContact()], tasks: [meeting] }}>
      <TaskEdit taskId={meeting.id} open close={() => {}} />
    </StoryWrapper>,
  );
  // The dialog shows its form before the meeting is fetched, then resets it:
  // anything typed earlier would be wiped.
  await expect
    .element(screen.getByLabelText(/description/i))
    .toHaveValue(meeting.text);
  return screen;
};

describe("TaskFormContent end time", () => {
  it("shows when the meeting ends rather than how long it lasts", async () => {
    const screen = await renderMeetingForm();

    await expect
      .element(screen.getByLabelText(/end time/i))
      .toHaveValue("15:30");
    await expect
      .element(screen.getByLabelText(/duration/i))
      .not.toBeInTheDocument();
  });

  it("moves the end time along with the start", async () => {
    const screen = await renderMeetingForm();

    const startInput = screen.getByLabelText(/date and time/i);
    await startInput.clear();
    await startInput.fill("2026-03-06T16:00");

    await expect
      .element(screen.getByLabelText(/end time/i))
      .toHaveValue("17:30");
  });

  it("refuses an end time earlier than the start", async () => {
    const screen = await renderMeetingForm();

    await screen.getByLabelText(/end time/i).fill("13:00");
    await screen.getByRole("button", { name: /^save$/i }).click();

    await expect
      .element(screen.getByText("The end time must be after the start time"))
      .toBeVisible();
  });

  it("refuses an end time equal to the start", async () => {
    const screen = await renderMeetingForm();

    await screen.getByLabelText(/end time/i).fill("14:00");
    await screen.getByRole("button", { name: /^save$/i }).click();

    await expect
      .element(screen.getByText("The end time must be after the start time"))
      .toBeVisible();
  });

  it("refuses a meeting that would end on another day", async () => {
    const screen = await renderMeetingForm();

    const startInput = screen.getByLabelText(/date and time/i);
    await startInput.clear();
    await startInput.fill("2026-03-06T23:00");
    await screen.getByRole("button", { name: /^save$/i }).click();

    await expect
      .element(screen.getByText("The meeting must end on the day it starts"))
      .toBeVisible();
  });

  it("keeps the meeting's length when the end time is emptied", async () => {
    const screen = await renderMeetingForm();

    await screen.getByLabelText(/end time/i).clear();

    await expect
      .element(screen.getByLabelText(/end time/i))
      .toHaveValue("15:30");
  });

  it("asks for a start once the date has been emptied", async () => {
    const screen = await renderMeetingForm();

    await screen.getByLabelText(/date and time/i).clear();
    await screen.getByRole("button", { name: /^save$/i }).click();

    await expect.element(screen.getByText("Required")).toBeVisible();
    await expect.element(screen.getByLabelText(/end time/i)).toHaveValue("");
  });
});
