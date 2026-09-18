import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Default, Empty } from "./DocumentTypesCard.stories";

describe("DocumentTypesCard", () => {
  it("lists the documents currently required from every user", async () => {
    // Arrange / Act
    const screen = await render(<Default />);

    // Assert
    await expect
      .element(screen.getByText("Carte d'identite"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Attestation URSSAF"))
      .toBeInTheDocument();
  });

  it("shows which documents have to be renewed every year", async () => {
    // Arrange
    const screen = await render(<Default />);
    await expect
      .element(screen.getByText("Attestation URSSAF"))
      .toBeInTheDocument();

    // Act
    const checkboxes = await screen.getByRole("checkbox").elements();

    // Assert — only the URSSAF certificate expires
    expect(
      checkboxes.map((checkbox) => checkbox.getAttribute("data-state")),
    ).toEqual(["unchecked", "checked"]);
  });

  it("adds a document type to the list", async () => {
    // Arrange
    const screen = await render(<Default />);
    const input = screen.getByLabelText("Document name (e.g. ID card)");

    // Act
    await input.fill("Permis de conduire");
    await screen.getByRole("button", { name: "Add" }).click();

    // Assert
    await expect
      .element(screen.getByText("Permis de conduire"))
      .toBeInTheDocument();
  });

  it("removes a document type from the list", async () => {
    // Arrange
    const screen = await render(<Default />);
    await expect
      .element(screen.getByText("Carte d'identite"))
      .toBeInTheDocument();

    // Act
    await screen
      .getByRole("button", { name: /delete carte d'identite/i })
      .click();

    // Assert
    await expect
      .element(screen.getByText("Carte d'identite"))
      .not.toBeInTheDocument();
  });

  it("says so when no document is required yet", async () => {
    // Arrange / Act
    const screen = await render(<Empty />);

    // Assert
    await expect
      .element(screen.getByText("No document required yet."))
      .toBeInTheDocument();
  });
});
