import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { CompanyTags, Default, Empty } from "./TagsCard.stories";

describe("TagsCard", () => {
  it("lists every tag with how many contacts use it", async () => {
    // Arrange / Act
    const screen = await render(<Default />);

    // Assert
    await expect.element(screen.getByText("Customer")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Trade show 2025"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Used by 1 contact"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("Unused")).toBeInTheDocument();
  });

  it("deletes a tag that no contact uses", async () => {
    // Arrange
    const screen = await render(<Default />);

    // Act
    await screen
      .getByRole("button", { name: "Delete Trade show 2025" })
      .click();

    // Assert
    await expect
      .element(screen.getByText("Trade show 2025"))
      .not.toBeInTheDocument();
    await expect.element(screen.getByText("Customer")).toBeInTheDocument();
  });

  it("does not let a tag still used by a contact be deleted", async () => {
    // Arrange / Act
    const screen = await render(<Default />);
    await expect
      .element(screen.getByText("Used by 1 contact"))
      .toBeInTheDocument();

    // Assert
    await expect
      .element(screen.getByRole("button", { name: "Delete Customer" }))
      .toBeDisabled();
  });

  it("says so when there is no tag yet", async () => {
    // Arrange / Act
    const screen = await render(<Empty />);

    // Assert
    await expect.element(screen.getByText("No tag yet.")).toBeInTheDocument();
  });

  it("lists company tags with how many companies use them", async () => {
    // Arrange / Act
    const screen = await render(<CompanyTags />);

    // Assert
    await expect.element(screen.getByText("Key account")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Used by 1 company"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("Unused")).toBeInTheDocument();
    await expect.element(screen.getByText("Customer")).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: "Delete Key account" }))
      .toBeDisabled();
  });
});
