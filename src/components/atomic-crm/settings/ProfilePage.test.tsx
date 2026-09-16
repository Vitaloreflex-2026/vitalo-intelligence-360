import { HttpError } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper } from "@/test/StoryWrapper";
import { ProfilePage } from "./ProfilePage";

const renderProfilePage = (updatePassword: () => Promise<unknown>) =>
  render(
    <StoryWrapper dataProvider={{ updatePassword } as any}>
      <ProfilePage />
    </StoryWrapper>,
  );

describe("ProfilePage", () => {
  it("confirms the reset email when the password change succeeds", async () => {
    // Arrange
    const screen = await renderProfilePage(async () => true);

    // Act
    await screen.getByRole("button", { name: "Change password" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "A reset password email has been sent to your email address",
        ),
      )
      .toBeVisible();
  });

  it("asks the user to wait when a reset email was already sent", async () => {
    // Arrange
    const screen = await renderProfilePage(() =>
      Promise.reject(
        new HttpError(
          "For security purposes, you can only request this after 60 seconds.",
          429,
        ),
      ),
    );

    // Act
    await screen.getByRole("button", { name: "Change password" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "A password reset email was just sent. Please wait a minute before asking for another one.",
        ),
      )
      .toBeVisible();
  });

  it("reports a failure when the reset email cannot be sent", async () => {
    // Arrange
    const screen = await renderProfilePage(() =>
      Promise.reject(new HttpError("Failed to update password", 500)),
    );

    // Act
    await screen.getByRole("button", { name: "Change password" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "The password reset email could not be sent. Please try again.",
        ),
      )
      .toBeVisible();
  });
});
