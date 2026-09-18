import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Default, NothingProvided } from "./SaleDocumentsDownloadCard.stories";

describe("SaleDocumentsDownloadCard", () => {
  it("offers a download for each provided document only", async () => {
    // Arrange
    const screen = await render(<Default />);
    await expect
      .element(screen.getByText("Carte d'identite"))
      .toBeInTheDocument();

    // Act
    const buttons = await screen
      .getByRole("button", { name: /^download$/i })
      .elements();

    // Assert — the missing RIB has nothing to download
    expect(buttons).toHaveLength(1);
  });

  it("offers the whole set as a single archive", async () => {
    // Arrange / Act
    const screen = await render(<Default />);

    // Assert
    await expect
      .element(screen.getByRole("button", { name: "Download all" }))
      .toBeEnabled();
  });

  it("has nothing to archive when the user provided no document", async () => {
    // Arrange / Act
    const screen = await render(<NothingProvided />);

    // Assert
    await expect
      .element(screen.getByRole("button", { name: "Download all" }))
      .toBeDisabled();
  });

  it("does not offer to upload on someone else's page", async () => {
    // Arrange
    const screen = await render(<Default />);
    await expect.element(screen.getByText("RIB")).toBeInTheDocument();

    // Assert
    expect(
      await screen.getByRole("button", { name: /upload|replace/i }).elements(),
    ).toHaveLength(0);
  });
});
