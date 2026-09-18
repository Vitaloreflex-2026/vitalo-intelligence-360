import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nContextProvider } from "ra-core";
import { MemoryRouter } from "react-router";
import { render } from "vitest-browser-react";

import { testI18nProvider } from "../providers/commons/i18nProvider";
import { MobileMoreMenu } from "./MobileMoreMenu";

const Fixture = () => (
  <QueryClientProvider client={new QueryClient()}>
    <I18nContextProvider value={testI18nProvider}>
      <MemoryRouter>
        <MobileMoreMenu />
      </MemoryRouter>
    </I18nContextProvider>
  </QueryClientProvider>
);

describe("MobileMoreMenu", () => {
  it("lists every section the bottom bar has no room for", async () => {
    const screen = await render(<Fixture />);

    await screen.getByRole("button", { name: "More" }).click();

    // Companies, assessments and deals used to be unreachable on a phone
    for (const section of [
      "Companies",
      "Assessments",
      "Deals",
      "Users",
      "Profile",
      "Settings",
    ]) {
      await expect
        .element(screen.getByRole("link", { name: section }))
        .toBeVisible();
    }
  });

  it("closes once a section is picked", async () => {
    const screen = await render(<Fixture />);

    await screen.getByRole("button", { name: "More" }).click();
    await screen.getByRole("link", { name: "Companies" }).click();

    await expect
      .element(screen.getByRole("link", { name: "Companies" }))
      .not.toBeInTheDocument();
  });
});
