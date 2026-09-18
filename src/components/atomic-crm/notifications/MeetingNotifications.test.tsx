import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Default } from "./MeetingNotifications.stories";

const openPanel = async () => {
  const screen = await render(<Default />);
  await screen.getByRole("button", { name: /notifications/i }).click();
  return screen;
};

describe("MeetingNotifications", () => {
  it("lists the meetings due today and the overdue ones", async () => {
    // Arrange / Act
    const screen = await openPanel();

    // Assert
    await expect
      .element(screen.getByText("Bilan de formation"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Point hebdomadaire"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Rendez-vous oublie"))
      .toBeInTheDocument();
  });

  it("lists overdue meetings above today's ones", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Rendez-vous oublie"))
      .toBeInTheDocument();

    // Act
    const headings = await screen.getByRole("heading").elements();

    // Assert
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Notifications",
      "Overdue",
      "Today",
    ]);
  });

  it("leaves out meetings that are not due yet", async () => {
    // Arrange / Act
    const screen = await openPanel();

    // Assert
    await expect
      .element(screen.getByText("Rendez-vous de demain"))
      .not.toBeInTheDocument();
  });

  it("leaves out meetings that are already done", async () => {
    // Arrange / Act
    const screen = await openPanel();

    // Assert
    await expect
      .element(screen.getByText("Rendez-vous deja traite"))
      .not.toBeInTheDocument();
  });

  it("shows the number of meetings still to handle", async () => {
    // Arrange
    const screen = await render(<Default />);

    // Act / Assert
    await expect.element(screen.getByText("3")).toBeInTheDocument();
  });

  it("drops a meeting from the list and the count once it is marked as done", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Rendez-vous oublie"))
      .toBeInTheDocument();

    // Act
    await screen
      .getByRole("button", { name: /mark as done/i })
      .first()
      .click();

    // Assert
    await expect
      .element(screen.getByText("Rendez-vous oublie"))
      .not.toBeInTheDocument();
    await expect.element(screen.getByText("2")).toBeInTheDocument();
  });

  it("removes an overdue meeting from the list when postponed to tomorrow", async () => {
    // Arrange
    const screen = await openPanel();
    await expect
      .element(screen.getByText("Rendez-vous oublie"))
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
      .element(screen.getByText("Bilan de formation"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Rendez-vous oublie"))
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
