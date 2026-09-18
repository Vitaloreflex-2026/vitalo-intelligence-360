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
  it("lists every screen the bottom bar has no room for", async () => {
    const screen = await render(<Fixture />);

    await screen.getByRole("button", { name: "More" }).click();

    // The bottom bar carries the five sections; these hang off the menu
    for (const section of ["Meetings", "Users", "Profile", "Settings"]) {
      await expect
        .element(screen.getByRole("link", { name: section }))
        .toBeVisible();
    }
  });

  it("closes once a section is picked", async () => {
    const screen = await render(<Fixture />);

    await screen.getByRole("button", { name: "More" }).click();
    await screen.getByRole("link", { name: "Settings" }).click();

    await expect
      .element(screen.getByRole("link", { name: "Settings" }))
      .not.toBeInTheDocument();
  });
});
