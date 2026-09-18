import type { ReactNode } from "react";
import { CoreAdminContext, ListBase } from "ra-core";
import fakeDataProvider from "ra-data-fakerest";
import { MemoryRouter } from "react-router";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { DataTable } from "./data-table";

const sales = [
  { id: 1, first_name: "Ada", last_name: "Lovelace", email: "ada@example.com" },
  {
    id: 2,
    first_name: "Grace",
    last_name: "Hopper",
    email: "grace@example.com",
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <CoreAdminContext
      dataProvider={fakeDataProvider({ sales })}
      i18nProvider={{
        // Render the last segment of the key, e.g. "…fields.first_name".
        translate: (key) => key.split(".").pop() ?? key,
        changeLocale: () => Promise.resolve(),
        getLocale: () => "en",
      }}
    >
      {children}
    </CoreAdminContext>
  </MemoryRouter>
);

const Fixture = () => (
  <ListBase resource="sales" disableSyncWithLocation>
    <DataTable bulkActionButtons={false}>
      <DataTable.Col source="first_name" />
      <DataTable.Col source="last_name" />
      <DataTable.Col source="email" />
    </DataTable>
  </ListBase>
);

describe("DataTable", () => {
  describe("on a wide viewport", () => {
    beforeAll(() => {
      page.viewport(1600, 900);
    });

    it("renders the records as a table", async () => {
      const screen = await render(<Fixture />, { wrapper: Wrapper });

      await expect.element(screen.getByRole("table")).toBeInTheDocument();
      await expect
        .element(screen.getByText("Ada", { exact: true }))
        .toBeVisible();
    });
  });

  describe("on a phone-sized viewport", () => {
    beforeAll(() => {
      page.viewport(375, 667);
    });

    it("renders each record as a card instead of a table", async () => {
      const screen = await render(<Fixture />, { wrapper: Wrapper });

      // Every cell is still there, so nothing hides behind a sideways scroll
      await expect
        .element(screen.getByText("Ada", { exact: true }))
        .toBeVisible();
      await expect
        .element(screen.getByText("ada@example.com", { exact: true }))
        .toBeVisible();
      await expect
        .element(screen.getByText("Grace", { exact: true }))
        .toBeVisible();
      await expect.element(screen.getByRole("table")).not.toBeInTheDocument();
    });

    it("labels every value with the column it came from", async () => {
      const screen = await render(<Fixture />, { wrapper: Wrapper });

      // The table header is gone, so the label moves next to the value
      await expect
        .element(screen.getByText("first_name", { exact: true }).first())
        .toBeVisible();
      await expect
        .element(screen.getByText("email", { exact: true }).first())
        .toBeVisible();
    });
  });
});
