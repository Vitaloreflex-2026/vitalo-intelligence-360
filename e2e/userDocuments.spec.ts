import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const signIn = async (page: Page) => {
  await page.goto("/");
  await page.getByLabel("Email").fill("john@doe.com");
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Latest Activity")).toBeVisible();
};

test.describe("user documents", () => {
  // The notification panel and the settings page are desktop-only surfaces.
  test.skip(({ isMobile }) => !!isMobile, "desktop-only screens");

  test.beforeEach(
    async ({ createSales, createContact, createDocumentType }) => {
      const sales = await createSales({
        first_name: "John",
        last_name: "Doe",
        email: "john@doe.com",
        password: "password",
        administrator: true,
      });

      await createContact({
        first_name: "Jane",
        last_name: "Smith",
        sales_id: sales.id,
        // The dashboard only renders once the account has a contact AND a note.
        notes: [{ text: "Met at a conference." }],
      });

      await createDocumentType({ label: "Identity card" });
      await createDocumentType({
        label: "Insurance certificate",
        requires_renewal: true,
      });
    },
  );

  test("reports the documents the user has not provided yet", async ({
    page,
  }) => {
    await signIn(page);

    const panelTrigger = page.getByRole("button", { name: "Notifications" });
    await expect(panelTrigger).toContainText("2");
    await panelTrigger.click();

    const panel = page.getByRole("dialog");
    await expect(panel.getByText("Documents to provide")).toBeVisible();
    await expect(panel.getByText("Identity card")).toBeVisible();
    await expect(panel.getByText("Insurance certificate")).toBeVisible();
  });

  test("lists the expected documents on the user's own profile", async ({
    page,
  }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Notifications" }).click();
    await page.getByRole("link", { name: "Upload" }).first().click();

    await expect(page.getByText("My documents")).toBeVisible();
    await expect(
      page.locator("#main-content").getByText("Identity card"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upload" }).first(),
    ).toBeVisible();
  });

  test("offers an administrator the documents of a team member", async ({
    page,
  }) => {
    await signIn(page);

    await page.goto("/#/sales");
    await page.getByText("john@doe.com").click();

    await expect(page.getByText("Identity card")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Download all" }),
    ).toBeVisible();
  });

  test("adds a document type from the settings page", async ({ page }) => {
    await signIn(page);

    await page.goto("/#/settings");

    // The settings page has an "Add" button per option list, so scope to the card.
    const documentsCard = page.locator("#documents");
    await expect(documentsCard.getByText("Identity card")).toBeVisible();

    // The admin remounts the whole page once shortly after boot (every list
    // refetches), which clears the field mid-interaction. Retry until the fill
    // and the click land on the same mount.
    await expect(async () => {
      await documentsCard
        .getByLabel("Document name (e.g. ID card)")
        .fill("Driving licence");
      await documentsCard
        .getByRole("button", { name: "Add", exact: true })
        .click({ timeout: 1000 });
    }).toPass();

    await expect(documentsCard.getByText("Driving licence")).toBeVisible();
  });
});
