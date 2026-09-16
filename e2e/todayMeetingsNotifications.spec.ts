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
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Latest Activity")).toBeVisible();
};

test.describe("today's meetings notifications", () => {
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
      text: "Rendez-vous de demain",
      due_date: atNoon(1),
    });
  });

  test("lists only the meetings due today", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Today's meetings" }).click();

    await expect(page.getByText("Bilan de formation")).toBeVisible();
    await expect(page.getByText("Rendez-vous de demain")).toBeHidden();
  });

  test("stops counting a meeting once it is marked as done", async ({
    page,
  }) => {
    await signIn(page);

    const panelTrigger = page.getByRole("button", { name: "Today's meetings" });
    await expect(panelTrigger).toContainText("1");
    await panelTrigger.click();
    await expect(page.getByText("Bilan de formation")).toBeVisible();

    await page.getByRole("button", { name: "Mark as done" }).click();

    await expect(panelTrigger).not.toContainText("1");
  });

  test("postpones a meeting to tomorrow", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Today's meetings" }).click();
    await expect(page.getByText("Bilan de formation")).toBeVisible();

    await page.getByRole("button", { name: "Postpone" }).click();
    await page.getByRole("menuitem", { name: "Postpone to tomorrow" }).click();

    await expect(page.getByText("Bilan de formation")).toBeHidden();
    await expect(page.getByText("No meeting today")).toBeVisible();
  });

  test("opens the edit dialog from the postpone menu", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Today's meetings" }).click();
    await page.getByRole("button", { name: "Postpone" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    await expect(
      page.getByRole("dialog", { name: "Edit meeting" }),
    ).toBeVisible();
  });
});
