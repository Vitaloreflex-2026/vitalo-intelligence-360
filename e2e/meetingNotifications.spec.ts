import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const atNoon = (dayOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};

const signIn = async (page: Page) => {
  await page.goto("/");
  await page.getByLabel("Email").fill("john@doe.com");
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Latest Activity")).toBeVisible();
};

test.describe("meetings to handle notifications", () => {
  // The notification panel lives in the desktop layout only; mobile has its own
  // bottom navigation in that corner.
  test.skip(({ isMobile }) => !!isMobile, "desktop-only panel");

  test.beforeEach(async ({ createSales, createContact, createTask }) => {
    const sales = await createSales({
      first_name: "John",
      last_name: "Doe",
      email: "john@doe.com",
      password: "password",
    });

    const contact = await createContact({
      first_name: "Jane",
      last_name: "Smith",
      sales_id: sales.id,
      // The dashboard only renders once the account has a contact AND a note;
      // without one it shows the onboarding stepper, which has no activity log
      // for signIn to wait on.
      notes: [{ text: "Met at a conference." }],
    });

    await createTask({
      contact_id: contact.id,
      sales_id: sales.id,
      text: "Bilan de formation",
      due_date: atNoon(0),
    });

    await createTask({
      contact_id: contact.id,
      sales_id: sales.id,
      text: "Rendez-vous oublie",
      due_date: atNoon(-3),
    });

    await createTask({
      contact_id: contact.id,
      sales_id: sales.id,
      text: "Rendez-vous de demain",
      due_date: atNoon(1),
    });
  });

  test("lists today's and overdue meetings, but not the upcoming ones", async ({
    page,
  }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Notifications" }).click();

    await expect(
      page.getByRole("dialog").getByText("Bilan de formation"),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog").getByText("Rendez-vous oublie"),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog").getByText("Rendez-vous de demain"),
    ).toBeHidden();
  });

  test("stops counting a meeting once it is marked as done", async ({
    page,
  }) => {
    await signIn(page);

    const panelTrigger = page.getByRole("button", {
      name: "Notifications",
    });
    await expect(panelTrigger).toContainText("2");
    await panelTrigger.click();
    await expect(
      page.getByRole("dialog").getByText("Bilan de formation"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mark as done" }).last().click();

    await expect(panelTrigger).toContainText("1");
  });

  test("postpones an overdue meeting to tomorrow", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(
      page.getByRole("dialog").getByText("Rendez-vous oublie"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Postpone" }).first().click();
    await page.getByRole("menuitem", { name: "Postpone to tomorrow" }).click();

    await expect(
      page.getByRole("dialog").getByText("Rendez-vous oublie"),
    ).toBeHidden();
    await expect(
      page.getByRole("dialog").getByText("Bilan de formation"),
    ).toBeVisible();
  });

  test("opens the edit dialog from the postpone menu", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Notifications" }).click();
    await page.getByRole("button", { name: "Postpone" }).first().click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    await expect(
      page.getByRole("dialog", { name: "Edit meeting" }),
    ).toBeVisible();
  });
});
