import { HttpError, RecordContextProvider } from "ra-core";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { DEFAULT_USER } from "@/components/atomic-crm/providers/fakerest/authProvider";
import { buildSale, StoryWrapper } from "@/test/StoryWrapper";
import { DeleteSaleButton } from "./DeleteSaleButton";

const renderButton = (
  salesDelete: (id: unknown) => Promise<unknown>,
  saleId: number = 42,
) =>
  render(
    <StoryWrapper dataProvider={{ salesDelete } as any}>
      <RecordContextProvider
        value={buildSale({ id: saleId, first_name: "Jane", last_name: "Doe" })}
      >
        <DeleteSaleButton />
      </RecordContextProvider>
    </StoryWrapper>,
  );

describe("DeleteSaleButton", () => {
  it("deletes the user once the deletion is confirmed", async () => {
    // Arrange
    const salesDelete = vi.fn(async () => undefined);
    const screen = await renderButton(salesDelete);

    // Act
    await screen.getByRole("button", { name: "Delete user" }).click();
    await expect.element(screen.getByText("Delete Jane Doe?")).toBeVisible();
    await screen.getByRole("button", { name: "Delete", exact: true }).click();

    // Assert
    await expect.element(screen.getByText("User deleted")).toBeVisible();
    expect(salesDelete).toHaveBeenCalledWith(42);
  });

  it("does not delete anything when the confirmation is cancelled", async () => {
    // Arrange
    const salesDelete = vi.fn(async () => undefined);
    const screen = await renderButton(salesDelete);

    // Act
    await screen.getByRole("button", { name: "Delete user" }).click();
    await screen.getByRole("button", { name: "Cancel" }).click();

    // Assert
    await expect
      .element(screen.getByText("Delete Jane Doe?"))
      .not.toBeInTheDocument();
    expect(salesDelete).not.toHaveBeenCalled();
  });

  it("reports a failure when the user cannot be deleted", async () => {
    // Arrange
    const screen = await renderButton(() =>
      Promise.reject(new HttpError("Failed to delete the user", 500)),
    );

    // Act
    await screen.getByRole("button", { name: "Delete user" }).click();
    await screen.getByRole("button", { name: "Delete", exact: true }).click();

    // Assert
    await expect
      .element(
        screen.getByText("The user could not be deleted. Please try again."),
      )
      .toBeVisible();
  });

  it("is not offered on one's own account", async () => {
    // Arrange
    const screen = await renderButton(async () => undefined, DEFAULT_USER.id);

    // Assert
    await expect
      .element(screen.getByRole("button", { name: "Delete user" }))
      .not.toBeInTheDocument();
  });
});
