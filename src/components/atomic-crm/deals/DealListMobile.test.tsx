import { render } from "vitest-browser-react";

import {
  MobileEmpty,
  MobileError,
  MobileSuccess,
} from "./DealList.mobile.stories";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DealListMobile", () => {
  it("renders every deal as a row rather than a Kanban column", async () => {
    const screen = await render(<MobileSuccess />);

    await expect.element(screen.getByText("Déploiement TMS")).toBeVisible();
    await expect.element(screen.getByText("Atelier managers")).toBeVisible();
    // The Kanban columns are gone: no stage heading, only a badge per row.
    await expect
      .element(screen.getByRole("heading", { name: "Opportunité" }))
      .not.toBeInTheDocument();
  });

  it("links each row to the deal it shows", async () => {
    const screen = await render(<MobileSuccess />);

    await expect
      .element(screen.getByRole("link", { name: /Déploiement TMS/ }))
      .toHaveAttribute("href", "/deals/1/show");
  });

  it("labels each deal with its stage", async () => {
    const screen = await render(<MobileSuccess />);

    await expect.element(screen.getByText("Opportunité")).toBeVisible();
    await expect.element(screen.getByText("Gagné")).toBeVisible();
  });

  it("tells the user the list is empty when there is no deal", async () => {
    const screen = await render(<MobileEmpty />);

    await expect.element(screen.getByText("No contracts found")).toBeVisible();
  });

  it("offers a retry when loading the deals fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const screen = await render(<MobileError />);

    await expect
      .element(screen.getByText("Error loading contracts"))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: /retry/i }))
      .toBeVisible();
  });
});
