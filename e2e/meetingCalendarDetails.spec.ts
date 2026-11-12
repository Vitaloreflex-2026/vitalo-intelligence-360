import { expect, test } from "./fixtures";

const todayAtNoon = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};

test.describe("meeting details in the dashboard calendar", () => {
  test.beforeEach(
    async ({ createSales, createCompany, createContact, createTask }) => {
      const sales = await createSales({
        first_name: "John",
        last_name: "Doe",
        email: "john@doe.com",
        password: "password",
      });

      const company = await createCompany({
        name: "Smith Corp",
        salesId: sales.id,
      });

      const contact = await createContact({
        first_name: "Jane",
        last_name: "Smith",
        sales_id: sales.id,
        company_id: company.id,
        // The dashboard only renders once the account has a contact AND a note;
        // without one it shows the onboarding stepper, which has no calendar.
        notes: [{ text: "Met at a conference." }],
      });

      await createTask({
        contact_id: contact.id,
        sales_id: sales.id,
        text: "Bilan de formation",
        due_date: todayAtNoon(),
      });
    },
  );

  test("shows the contact and the company of the meeting clicked in the calendar", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Email").fill("john@doe.com");
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(
      page.getByRole("heading", { name: "Team meetings" }),
    ).toBeVisible();

    // The meeting is also listed beside the calendar, and a calendar block has
    // no role of its own, so aim at the block itself.
    await page
      .locator(".meetings-calendar .fc-event", {
        hasText: "Bilan de formation",
      })
      .click();

    const dialog = page.getByRole("dialog", { name: "Edit meeting" });
    await expect(
      dialog.getByRole("link", { name: "Jane Smith" }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: "Smith Corp" }),
    ).toBeVisible();
  });

  test("closes the meeting dialog when its contact link is followed from the notifications", async ({
    page,
    isMobile,
  }) => {
    // The notification panel lives in the desktop layout only.
    test.skip(!!isMobile, "desktop-only panel");

    await page.goto("/");
    await page.getByLabel("Email").fill("john@doe.com");
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(
      page.getByRole("heading", { name: "Team meetings" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Notifications" }).click();
    await page.getByRole("button", { name: "Postpone" }).first().click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    const dialog = page.getByRole("dialog", { name: "Edit meeting" });

    // The panel outlives the navigation, so only the dialog closing itself
    // can uncover the contact page the link leads to.
    await dialog.getByRole("link", { name: "Jane Smith" }).click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/contacts\/\d+\/show/);
  });
});
