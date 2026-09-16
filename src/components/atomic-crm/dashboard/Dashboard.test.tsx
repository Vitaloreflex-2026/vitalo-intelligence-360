import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper, buildContact } from "@/test/StoryWrapper";
import type { ContactNote } from "../types";
import { Dashboard } from "./Dashboard";

const buildNote = (): ContactNote => ({
  id: 1,
  contact_id: 1,
  sales_id: 0,
  date: "2026-09-15T09:00:00.000Z",
  status: "warm",
  text: "Met at a conference.",
});

describe("Dashboard", () => {
  it("shows the meeting calendar and the activity log once the account is set up", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper
        data={{ contacts: [buildContact()], contact_notes: [buildNote()] }}
      >
        <Dashboard />
      </StoryWrapper>,
    );

    // Assert
    await expect.element(screen.getByText("My meetings")).toBeVisible();
    await expect.element(screen.getByText("Latest Activity")).toBeVisible();
  });

  it("shows the onboarding stepper instead while the account has no note", async () => {
    // Arrange & Act — this is the state the meetingNotifications e2e fixture
    // used to land in, which is why its sign-in helper timed out waiting for
    // the activity log.
    const screen = await render(
      <StoryWrapper data={{ contacts: [buildContact()], contact_notes: [] }}>
        <Dashboard />
      </StoryWrapper>,
    );

    // Assert
    await expect.element(screen.getByText(/what.s next/i)).toBeVisible();
    expect(screen.getByText("Latest Activity").elements()).toHaveLength(0);
  });
});
