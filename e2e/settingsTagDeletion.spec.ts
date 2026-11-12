import { expect, test } from "./fixtures";

test("admin deletes an unused tag from the settings page", async ({
  page,
  isMobile,
  createSales,
  createContact,
  createTag,
}) => {
  test.skip(isMobile, "The settings page is desktop-only");

  const sales = await createSales({
    first_name: "John",
    last_name: "Doe",
    email: "john@doe.com",
    password: "password",
    administrator: true,
  });
  const usedTag = await createTag({ name: "Customer" });
  await createTag({ name: "Trade show 2025" });
  await createContact({
    first_name: "Jane",
    last_name: "Smith",
    sales_id: sales.id,
    tags: [usedTag.id],
    // The dashboard only renders once the account has a contact AND a note.
    notes: [{ text: "Met at a conference." }],
  });

  await page.goto("/");
  await page.getByLabel("Email").fill("john@doe.com");
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Latest Activity")).toBeVisible();

  await page.goto("/#/settings");
  const tagsCard = page.locator("#tags");

  // A tag still attached to a contact cannot be deleted.
  await expect(tagsCard.getByText("Used by 1 contact")).toBeVisible();
  await expect(
    tagsCard.getByRole("button", { name: "Delete Customer" }),
  ).toBeDisabled();

  await tagsCard
    .getByRole("button", { name: "Delete Trade show 2025" })
    .click();

  await expect(tagsCard.getByText("Trade show 2025")).not.toBeVisible();
  await expect(tagsCard.getByText("Customer")).toBeVisible();
});
