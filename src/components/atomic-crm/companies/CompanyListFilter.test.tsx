import { ResourceContextProvider } from "ra-core";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { StoryWrapper, buildCompany } from "@/test/StoryWrapper";

import { CompanyList } from "./CompanyList";

const companies = [
  buildCompany({ id: 1, name: "Batilor", sector: "Industrie" }),
  buildCompany({ id: 2, name: "Novaterre", sector: "Énergie" }),
];

const renderCompanyList = (initialEntries?: string[]) =>
  render(
    <StoryWrapper data={{ companies }} initialEntries={initialEntries}>
      <ResourceContextProvider value="companies">
        <CompanyList />
      </ResourceContextProvider>
    </StoryWrapper>,
  );

describe("CompanyListFilter", () => {
  beforeEach(() => {
    page.viewport(1600, 900);
  });

  it("keeps the sectors in a dropdown instead of listing them in the sidebar", async () => {
    const screen = await renderCompanyList();

    await expect
      .element(screen.getByRole("combobox", { name: "Sector" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: "Finance" }))
      .not.toBeInTheDocument();
  });

  it("filters the companies by the sector picked in the dropdown", async () => {
    const screen = await renderCompanyList();
    await expect.element(screen.getByText("Batilor")).toBeVisible();

    await screen.getByRole("combobox", { name: "Sector" }).click();
    await screen.getByRole("option", { name: "Énergie" }).click();

    await expect.element(screen.getByText("Novaterre")).toBeVisible();
    await expect.element(screen.getByText("Batilor")).not.toBeInTheDocument();
  });

  it("shows every company again once the sector is cleared", async () => {
    const screen = await renderCompanyList();
    await screen.getByRole("combobox", { name: "Sector" }).click();
    await screen.getByRole("option", { name: "Énergie" }).click();
    await expect.element(screen.getByText("Batilor")).not.toBeInTheDocument();

    await screen.getByRole("button", { name: /clear/i }).click();

    await expect.element(screen.getByText("Batilor")).toBeVisible();
    await expect.element(screen.getByText("Novaterre")).toBeVisible();
  });

  it("still shows an active sector that is no longer in the sector list", async () => {
    const filter = encodeURIComponent(
      JSON.stringify({ sector: "Agriculture" }),
    );
    const screen = await renderCompanyList([`/?filter=${filter}`]);

    await expect
      .element(screen.getByRole("combobox", { name: "Sector" }))
      .toHaveTextContent("Agriculture");
  });
});
