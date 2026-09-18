import { I18nContextProvider } from "ra-core";
import { MemoryRouter } from "react-router";
import { render } from "vitest-browser-react";

import { testI18nProvider } from "../providers/commons/i18nProvider";
import { HeaderMenuButton } from "./HeaderMenuButton";

const Fixture = ({ initialEntries = ["/"] }: { initialEntries?: string[] }) => (
  <I18nContextProvider value={testI18nProvider}>
    <MemoryRouter initialEntries={initialEntries}>
      <HeaderMenuButton />
    </MemoryRouter>
  </I18nContextProvider>
);

describe("HeaderMenuButton", () => {
  it("lists every section of the header tab bar", async () => {
    const screen = await render(<Fixture />);

    await screen.getByRole("button", { name: "CRM navigation" }).click();

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
    const screen = await render(
      <Fixture initialEntries={["/assessments/3"]} />,
    );

    await screen.getByRole("button", { name: "CRM navigation" }).click();

    await expect
      .element(screen.getByRole("link", { name: "Assessments" }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(screen.getByRole("link", { name: "Deals" }))
      .not.toHaveAttribute("aria-current");
  });

  it("closes once a section is picked", async () => {
    const screen = await render(<Fixture />);

    await screen.getByRole("button", { name: "CRM navigation" }).click();
    await screen.getByRole("link", { name: "Deals" }).click();

    await expect
      .element(screen.getByRole("link", { name: "Deals" }))
      .not.toBeInTheDocument();
  });
});
