import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper } from "@/test/StoryWrapper";
import { DashboardHero } from "./DashboardHero";

describe("DashboardHero", () => {
  it("greets the signed-in user by first name", async () => {
    // Arrange & Act: the test identity is "Jane Doe"
    const screen = await render(
      <StoryWrapper>
        <DashboardHero />
      </StoryWrapper>,
    );

    // Assert
    await expect
      .element(screen.getByRole("heading", { name: "Hello Jane" }))
      .toBeVisible();
  });

  it("links to the contact and company creation forms", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper>
        <DashboardHero />
      </StoryWrapper>,
    );

    // Assert
    await expect
      .element(screen.getByRole("link", { name: "Create contact" }))
      .toHaveAttribute("href", expect.stringContaining("/contacts/create"));
    await expect
      .element(screen.getByRole("link", { name: "Create Company" }))
      .toHaveAttribute("href", expect.stringContaining("/companies/create"));
  });
});
