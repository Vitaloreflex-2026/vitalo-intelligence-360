import { HttpError, RecordContextProvider } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { buildSale, StoryWrapper } from "@/test/StoryWrapper";
import { ResendInvitationButton } from "./ResendInvitationButton";

const renderButton = (salesReinvite: () => Promise<unknown>) =>
  render(
    <StoryWrapper dataProvider={{ salesReinvite } as any}>
      <RecordContextProvider value={buildSale({ id: 42 })}>
        <ResendInvitationButton />
      </RecordContextProvider>
    </StoryWrapper>,
  );

describe("ResendInvitationButton", () => {
  it("confirms the new invitation when the email is sent", async () => {
    // Arrange
    const screen = await renderButton(async () => ({ kind: "invite" }));

    // Act
    await screen.getByRole("button", { name: "Resend invitation" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "A new invitation email has been sent. The previous link no longer works.",
        ),
      )
      .toBeVisible();
  });

  it("reports the password link sent to an already activated account", async () => {
    // Arrange
    const screen = await renderButton(async () => ({ kind: "recovery" }));

    // Act
    await screen.getByRole("button", { name: "Resend invitation" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "This user had already activated their account: a password reset email has been sent instead.",
        ),
      )
      .toBeVisible();
  });

  it("asks the user to wait when an invitation was just sent", async () => {
    // Arrange
    const screen = await renderButton(() =>
      Promise.reject(
        new HttpError(
          "For security purposes, you can only request this after 60 seconds.",
          429,
        ),
      ),
    );

    // Act
    await screen.getByRole("button", { name: "Resend invitation" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "An invitation email was just sent. Please wait a minute before asking for another one.",
        ),
      )
      .toBeVisible();
  });

  it("reports a failure when the invitation cannot be sent", async () => {
    // Arrange
    const screen = await renderButton(() =>
      Promise.reject(new HttpError("Failed to send the invitation", 500)),
    );

    // Act
    await screen.getByRole("button", { name: "Resend invitation" }).click();

    // Assert
    await expect
      .element(
        screen.getByText(
          "The invitation email could not be sent. Please try again.",
        ),
      )
      .toBeVisible();
  });
});
