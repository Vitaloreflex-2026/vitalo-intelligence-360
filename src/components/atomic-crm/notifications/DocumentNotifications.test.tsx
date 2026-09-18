import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WithDocuments } from "./MeetingNotifications.stories";

const openPanel = async () => {
  const screen = await render(<WithDocuments />);
  await screen.getByRole("button", { name: /notifications/i }).click();
  return screen;
};

describe("document notifications", () => {
  it("counts documents to handle alongside the meetings", async () => {
    // Arrange / Act — 3 meetings to handle, plus a missing and an expired paper
    const screen = await render(<WithDocuments />);

    // Assert
    await expect.element(screen.getByText("5")).toBeInTheDocument();
  });

  it("groups papers to renew apart from the ones never provided", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Documents to renew"))
      .toBeInTheDocument();

    // Act
    const headings = await screen.getByRole("heading").elements();

    // Assert — renewals come before the merely missing papers
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Notifications",
      "Overdue",
      "Today",
      "Documents to renew",
      "Documents to provide",
    ]);
  });

  it("names the paper that expired and the one never provided", async () => {
    // Arrange / Act
    const screen = await openPanel();

    // Assert
    await expect
      .element(screen.getByText("Attestation URSSAF"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("RIB")).toBeInTheDocument();
    await expect.element(screen.getByText("Expired")).toBeInTheDocument();
    await expect.element(screen.getByText("Missing")).toBeInTheDocument();
  });

  it("sends the user to their profile to provide a paper", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Documents to renew"))
      .toBeInTheDocument();

    // Act
    const links = await screen
      .getByRole("link", { name: /upload/i })
      .elements();

    // Assert
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute("href")).toBe("/profile");
  });
});
