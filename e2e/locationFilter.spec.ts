import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

const filterByLocation = async (
  page: Page,
  isMobile: boolean,
  field: "City" | "State",
  value: string,
) => {
  if (isMobile) {
    await page.getByRole("button", { name: "Add filter" }).click();
  }
  await page.getByRole("textbox", { name: field, exact: true }).fill(value);
  if (isMobile) {
    await page.getByRole("button", { name: "Confirm" }).click();
  }
};

test.describe("filtering by location", () => {
  test.beforeEach(async ({ createSales, createCompany, createContact }) => {
    const user = await createSales({
      administrator: true,
      email: "john@doe.com",
      first_name: "John",
      last_name: "Doe",
      password: "password",
    });

    const lyonCompany = await createCompany({
      name: "Batilor",
      salesId: user.id,
      city: "Lyon",
      state_abbr: "Auvergne-Rhône-Alpes",
    });
    const nantesCompany = await createCompany({
      name: "Novaterre",
      salesId: user.id,
      city: "Nantes",
      state_abbr: "Pays de la Loire",
    });

    await createContact({
      company_id: lyonCompany.id,
      first_name: "Ada",
      last_name: "Lovelace",
      sales_id: user.id,
    });
    await createContact({
      company_id: nantesCompany.id,
      first_name: "Grace",
      last_name: "Hopper",
      sales_id: user.id,
    });
  });

  test.beforeEach(async ({ page, menu }) => {
    await page.goto("/");
    await page.getByLabel("Email").fill("john@doe.com");
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await menu.goToContacts();
  });

  test("narrows the contact list down to a city, whatever the case", async ({
    page,
    isMobile,
  }) => {
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Grace Hopper")).toBeVisible();

    await filterByLocation(page, isMobile, "City", "lyon");

    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Grace Hopper")).toBeHidden();

    await filterByLocation(page, isMobile, "City", "");

    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Grace Hopper")).toBeVisible();
  });

  test("narrows the contact list down to a region", async ({
    page,
    isMobile,
  }) => {
    await filterByLocation(page, isMobile, "State", "loire");

    await expect(page.getByText("Grace Hopper")).toBeVisible();
    await expect(page.getByText("Ada Lovelace")).toBeHidden();
  });

  test("narrows the company list down to a city or a region", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/#/companies");
    await expect(page.getByText("Batilor")).toBeVisible();
    await expect(page.getByText("Novaterre")).toBeVisible();

    await filterByLocation(page, isMobile, "City", "nantes");

    await expect(page.getByText("Novaterre")).toBeVisible();
    await expect(page.getByText("Batilor")).toBeHidden();

    await filterByLocation(page, isMobile, "City", "");
    await expect(page.getByText("Batilor")).toBeVisible();

    await filterByLocation(page, isMobile, "State", "rhône");

    await expect(page.getByText("Batilor")).toBeVisible();
    await expect(page.getByText("Novaterre")).toBeHidden();
  });
});
