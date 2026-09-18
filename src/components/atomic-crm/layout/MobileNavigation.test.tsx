import { I18nContextProvider } from "ra-core";
import { MemoryRouter } from "react-router";
import { render } from "vitest-browser-react";

import { testI18nProvider } from "../providers/commons/i18nProvider";
import { MobileNavigation } from "./MobileNavigation";

const Fixture = ({ initialEntries = ["/"] }: { initialEntries?: string[] }) => (
  <I18nContextProvider value={testI18nProvider}>
    <MemoryRouter initialEntries={initialEntries}>
      <MobileNavigation />
    </MemoryRouter>
  </I18nContextProvider>
);

describe("MobileNavigation", () => {
  it("offers the same top-level sections as the desktop header", async () => {
    const screen = await render(<Fixture />);

    for (const section of [
      "Dashboard",
      "Companies",
      "Contacts",
      "Assessments",
      "Deals",
    ]) {
      await expect
        .element(screen.getByRole("link", { name: section }))
        .toBeVisible();
    }
  });

  it("marks the section currently displayed", async () => {
    const screen = await render(<Fixture initialEntries={["/companies/7"]} />);

    await expect
      .element(screen.getByRole("link", { name: "Companies" }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(screen.getByRole("link", { name: "Deals" }))
      .not.toHaveAttribute("aria-current");
  });

  it("keeps its five slots within a narrow screen", async () => {
    const screen = await render(<Fixture />);

    await expect
      .element(screen.getByRole("link", { name: "Assessments" }))
      .toBeVisible();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  });
});
