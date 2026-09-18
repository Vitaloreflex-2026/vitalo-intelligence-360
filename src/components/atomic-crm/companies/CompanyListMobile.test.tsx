import { render } from "vitest-browser-react";

import {
  MobileEmpty,
  MobileError,
  MobileSuccess,
} from "./CompanyList.mobile.stories";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CompanyListMobile", () => {
  it("renders every company as a row rather than a card grid", async () => {
    const screen = await render(<MobileSuccess />);

    await expect.element(screen.getByText("Batilor")).toBeVisible();
    await expect.element(screen.getByText("Novaterre")).toBeVisible();
  });

  it("links each row to the company it shows", async () => {
    const screen = await render(<MobileSuccess />);

    await expect
      .element(screen.getByRole("link", { name: /Batilor/ }))
      .toHaveAttribute("href", "/companies/1/show");
  });

  it("summarises each company's contacts and deals", async () => {
    const screen = await render(<MobileSuccess />);

    await expect.element(screen.getByText(/3 contacts/)).toBeVisible();
    await expect.element(screen.getByText(/2 deals/)).toBeVisible();
    await expect.element(screen.getByText(/No contact/)).toBeVisible();
  });

  it("tells the user the list is empty when there is no company", async () => {
    const screen = await render(<MobileEmpty />);

    await expect.element(screen.getByText("No companies found")).toBeVisible();
  });

  it("offers a retry when loading the companies fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const screen = await render(<MobileError />);

    await expect
      .element(screen.getByText("Error loading companies"))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: /retry/i }))
      .toBeVisible();
  });
});
