import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Default } from "./MeetingNotifications.stories";

const openPanel = async () => {
  const screen = await render(<Default />);
  await screen.getByRole("button", { name: /today's meetings/i }).click();
  return screen;
};

describe("MeetingNotifications", () => {
  it("lists only the meetings due today", async () => {
    // Arrange / Act
    const screen = await openPanel();

    // Assert
    await expect
      .element(screen.getByText("Bilan de formation"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Point hebdomadaire"))
      .toBeInTheDocument();
    expect(screen.getByText("Rendez-vous de demain").elements()).toHaveLength(
      0,
    );
  });

  it("shows the number of meetings still to handle", async () => {
    // Arrange
    const screen = await render(<Default />);

    // Act / Assert
    await expect.element(screen.getByText("2")).toBeInTheDocument();
  });

  it("drops a meeting from the pending count once it is marked as done", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Bilan de formation"))
      .toBeInTheDocument();

    // Act
    await screen
      .getByRole("button", { name: /mark as done/i })
      .first()
      .click();

    // Assert
    await expect.element(screen.getByText("1")).toBeInTheDocument();
  });

  it("removes a meeting from today's list when postponed to tomorrow", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Bilan de formation"))
      .toBeInTheDocument();

    // Act
    await screen
      .getByRole("button", { name: /postpone/i })
      .first()
      .click();
    await screen
      .getByRole("menuitem", { name: /postpone to tomorrow/i })
      .click();

    // Assert
    await expect
      .element(screen.getByText("Point hebdomadaire"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Bilan de formation"))
      .not.toBeInTheDocument();
  });

  it("opens the meeting edit dialog from the postpone menu", async () => {
    // Arrange
    const screen = await openPanel();

    // Act
    await screen
      .getByRole("button", { name: /postpone/i })
      .first()
      .click();
    await screen.getByRole("menuitem", { name: /^edit$/i }).click();

    // Assert
    await expect
      .element(screen.getByRole("dialog", { name: /edit meeting/i }))
      .toBeInTheDocument();
  });
});
