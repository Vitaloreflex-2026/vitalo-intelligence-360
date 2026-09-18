import { HttpError } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper, buildSale } from "@/test/StoryWrapper";
import type { Sale, SalesFormData } from "../types";
import { ProfilePage } from "./ProfilePage";

const renderProfilePage = (updatePassword: () => Promise<unknown>) =>
  render(
    <StoryWrapper dataProvider={{ updatePassword } as any}>
      <ProfilePage />
    </StoryWrapper>,
  );

const CALENDAR_URL =
  "https://calendar.google.com/calendar/ical/me%40example.com/private-abcdefghijklmnopqrstuvwxyz012345/basic.ics";

const OTHER_CALENDAR_URL = "https://example.com/famille.ics";

/** The signed-in user, with whatever calendars the scenario needs. */
const renderProfileWithCalendars = (
  icalUrls: string[],
  salesUpdate: (id: unknown, data: SalesFormData) => Promise<Sale> = async () =>
    buildSale(),
) =>
  render(
    <StoryWrapper
      data={{ sales: [buildSale({ ical_urls: icalUrls })] }}
      dataProvider={{ salesUpdate } as any}
    >
      <ProfilePage />
    </StoryWrapper>,
  );

describe("ProfilePage", () => {
  it("confirms the reset email when the password change succeeds", async () => {
    // Arrange
    const screen = await renderProfilePage(async () => true);

    // Act
    await screen.getByRole("button", { name: "Change password" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "A reset password email has been sent to your email address",
        ),
      )
      .toBeVisible();
  });

  it("asks the user to wait when a reset email was already sent", async () => {
    // Arrange
    const screen = await renderProfilePage(() =>
      Promise.reject(
        new HttpError(
          "For security purposes, you can only request this after 60 seconds.",
          429,
        ),
      ),
    );

    // Act
    await screen.getByRole("button", { name: "Change password" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "A password reset email was just sent. Please wait a minute before asking for another one.",
        ),
      )
      .toBeVisible();
  });

  it("reports a failure when the reset email cannot be sent", async () => {
    // Arrange
    const screen = await renderProfilePage(() =>
      Promise.reject(new HttpError("Failed to update password", 500)),
    );

    // Act
    await screen.getByRole("button", { name: "Change password" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "The password reset email could not be sent. Please try again.",
        ),
      )
      .toBeVisible();
  });

  it("lists the external calendars the user follows", async () => {
    // Arrange & Act
    const screen = await renderProfileWithCalendars([CALENDAR_URL]);

    // Assert
    await expect.element(screen.getByText(CALENDAR_URL)).toBeVisible();
  });

  it("keeps a long calendar address inside the card", async () => {
    // Arrange
    const screen = await renderProfileWithCalendars([CALENDAR_URL]);
    const line = screen.getByText(CALENDAR_URL);
    await expect.element(line).toBeVisible();

    // Assert — clipped rather than wrapped, with the whole address on hover.
    const element = line.element() as HTMLElement;
    expect(element.scrollWidth).toBeGreaterThan(element.clientWidth);
    expect(element.title).toBe(CALENDAR_URL);
  });

  it("offers a row per calendar plus an add button in edit mode", async () => {
    // Arrange
    const screen = await renderProfileWithCalendars([CALENDAR_URL]);

    // Act
    await screen.getByRole("button", { name: "Edit" }).click();

    // Assert — the iterator reads its resource from context, which this
    // standalone form does not otherwise provide; without it the page throws.
    await expect
      .element(screen.getByRole("button", { name: "Add" }))
      .toBeVisible();
    await expect
      .poll(() => document.querySelectorAll('input[name^="ical_urls."]').length)
      .toBe(1);
  });

  it("adds an empty row when the user asks for another calendar", async () => {
    // Arrange
    const screen = await renderProfileWithCalendars([CALENDAR_URL]);
    await screen.getByRole("button", { name: "Edit" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Add" }))
      .toBeVisible();

    // Act
    await screen.getByRole("button", { name: "Add" }).click();

    // Assert
    await expect
      .poll(() => document.querySelectorAll('input[name^="ical_urls."]').length)
      .toBe(2);
  });

  it("saves the whole list of calendars", async () => {
    // Arrange
    const saved: SalesFormData[] = [];
    const screen = await renderProfileWithCalendars(
      [CALENDAR_URL],
      async (_id, data) => {
        saved.push(data);
        return buildSale();
      },
    );
    await screen.getByRole("button", { name: "Edit" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Add" }))
      .toBeVisible();

    // Act — change the existing address, then save.
    const row = document.querySelector<HTMLInputElement>(
      'input[name="ical_urls.0"]',
    )!;
    await screen.getByRole("textbox").nth(3).fill(OTHER_CALENDAR_URL);
    expect(row.value).toBe(OTHER_CALENDAR_URL);
    await screen.getByRole("button", { name: "Save" }).click();

    // Assert
    await expect.poll(() => saved.length).toBe(1);
    expect(saved[0].ical_urls).toEqual([OTHER_CALENDAR_URL]);
  });
});
