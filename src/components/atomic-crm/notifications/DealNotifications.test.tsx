import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WithDealAlerts } from "./MeetingNotifications.stories";

const openPanel = async () => {
  const screen = await render(<WithDealAlerts />);
  await screen.getByRole("button", { name: /notifications/i }).click();
  return screen;
};

describe("contract notifications", () => {
  it("counts the contract paperwork alongside the meetings", async () => {
    // Arrange / Act — 3 meetings to handle, plus one alert per contract
    const screen = await render(<WithDealAlerts />);

    // Assert
    await expect.element(screen.getByText("6")).toBeInTheDocument();
  });

  it("names what each contract still owes", async () => {
    // Arrange / Act
    const screen = await openPanel();

    // Assert
    await expect
      .element(screen.getByText("Prevention TMS"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/Quote not signed/))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/Data not filed on the portal/))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/OPCO file not submitted/))
      .toBeInTheDocument();
  });

  it("separates missed deadlines from the paperwork still in time", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Overdue contracts"))
      .toBeInTheDocument();

    // Act
    const headings = await screen.getByRole("heading").elements();

    // Assert — missed deadlines are listed before the ones still in their window
    const contractHeadings = headings
      .map((heading) => heading.textContent)
      .filter((title) => /contracts/i.test(title ?? ""));
    expect(contractHeadings).toEqual([
      "Overdue contracts",
      "Contracts to complete",
    ]);
  });

  it("opens the contract the alert is about", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Overdue contracts"))
      .toBeInTheDocument();

    // Act
    const links = await screen.getByRole("link", { name: /open/i }).elements();

    // Assert
    expect(links.map((link) => link.getAttribute("href"))).toContain(
      "/deals/1/show",
    );
  });
});
