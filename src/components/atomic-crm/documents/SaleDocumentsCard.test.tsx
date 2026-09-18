import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Default, WithoutDocumentTypes } from "./SaleDocumentsCard.stories";

describe("SaleDocumentsCard", () => {
  it("lists every document the user is expected to provide", async () => {
    // Arrange / Act
    const screen = await render(<Default />);

    // Assert
    await expect
      .element(screen.getByText("Carte d'identite"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("RIB")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Attestation URSSAF"))
      .toBeInTheDocument();
  });

  it("flags a document that was never uploaded as missing", async () => {
    // Arrange / Act
    const screen = await render(<Default />);

    // Assert
    await expect.element(screen.getByText("Missing")).toBeInTheDocument();
  });

  it("flags a yearly document uploaded over a year ago as expired", async () => {
    // Arrange / Act
    const screen = await render(<Default />);

    // Assert
    await expect.element(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("offers to upload a missing document and to replace a filed one", async () => {
    // Arrange / Act
    const screen = await render(<Default />);
    await expect.element(screen.getByText("RIB")).toBeInTheDocument();

    // Assert — one upload button for the missing RIB, two replace buttons
    expect(
      await screen.getByRole("button", { name: /^upload$/i }).elements(),
    ).toHaveLength(1);
    expect(
      await screen.getByRole("button", { name: /^replace$/i }).elements(),
    ).toHaveLength(2);
  });

  it("marks a document as provided once the user uploads a file", async () => {
    // Arrange
    const screen = await render(<Default />);
    await expect.element(screen.getByText("Missing")).toBeInTheDocument();
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
    ).toHaveLength(3);
  });

  it("says so when no document is required", async () => {
    // Arrange / Act
    const screen = await render(<WithoutDocumentTypes />);

    // Assert
    await expect
      .element(screen.getByText("No document is required yet"))
      .toBeInTheDocument();
  });
});
