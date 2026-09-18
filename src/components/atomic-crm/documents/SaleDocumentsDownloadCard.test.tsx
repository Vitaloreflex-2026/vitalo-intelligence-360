import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
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

  it("lets an administrator file a document on the user's behalf", async () => {
    // Arrange
    const screen = await render(<Default />);
    await expect.element(screen.getByText("RIB")).toBeInTheDocument();
    const input = screen.getByLabelText("Upload RIB");

    // Act
    await userEvent.upload(
      input,
      new File(["bank details"], "rib.pdf", { type: "application/pdf" }),
    );

    // Assert
    await expect.element(screen.getByText("Missing")).not.toBeInTheDocument();
    expect(
      await screen.getByRole("button", { name: /^replace$/i }).elements(),
    ).toHaveLength(2);
  });
});
