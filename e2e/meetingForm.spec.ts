import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** Signs in and opens the meeting creation form from Jane Smith's page. */
const openMeetingForm = async (
  page: Page,
  isMobile: boolean | undefined,
  goToContacts: () => Promise<void>,
) => {
  await page.goto("/");
  await page.getByLabel("Email").fill("john@doe.com");
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("heading", { name: "Team meetings" }),
  ).toBeVisible();

  await goToContacts();
  await page.getByText("Jane Smith").click();
  await page.waitForLoadState("networkidle");

  if (isMobile) {
    await page.getByRole("button", { name: "Create" }).click();
    await page.getByRole("menuitem", { name: "Meeting" }).click();
  } else {
    await page.getByRole("button", { name: "Add meeting" }).click();
  }
};

test.describe("meeting form", () => {
  test.beforeEach(async ({ createSales, createContact }) => {
    const sales = await createSales({
      first_name: "John",
      last_name: "Doe",
      email: "john@doe.com",
      password: "password",
    });

    await createContact({
      first_name: "Jane",
      last_name: "Smith",
      sales_id: sales.id,
      // The dashboard only renders once the account has a contact AND a note.
      notes: [{ text: "Met at a conference." }],
    });
  });

  test("a meeting keeps the end time it was booked with", async ({
    page,
    isMobile,
    menu,
    dismissToast,
  }) => {
    await openMeetingForm(page, isMobile, menu.goToContacts);

    await page.getByLabel("Description *").fill("Follow up with Jane");
    await page.getByLabel("Date and time").fill("2026-04-11T21:00");
    await page.getByLabel("End time").fill("22:30");
    await page.getByLabel("Meeting type").click();
    await page.getByRole("option", { name: "Premier contact" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    await dismissToast("Meeting added");

    if (isMobile) {
      await page.getByText("1 meeting").click();
    }
    await page.getByRole("button", { name: "meeting actions" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    await expect(page.getByLabel("End time")).toHaveValue("22:30");
  });

  test("a meeting cannot be saved once its date has been emptied", async ({
    page,
    isMobile,
    menu,
  }) => {
    await openMeetingForm(page, isMobile, menu.goToContacts);

    await page.getByLabel("Date and time").fill("");
    await page.getByLabel("Description *").fill("Follow up with Jane");
    await page.getByLabel("Meeting type").click();
    await page.getByRole("option", { name: "Premier contact" }).click();
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Required")).toBeVisible();
  });
});
