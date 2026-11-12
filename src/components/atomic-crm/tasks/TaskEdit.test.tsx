import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper, buildCompany, buildContact } from "@/test/StoryWrapper";

describe("TaskEdit", () => {
  it("closes when its contact link is followed from that contact's own page", async () => {
    // Arrange — a desktop width, where a meeting opens in the dialog rather
    // than the mobile sheet. The contact page stays mounted across the click,
    // so nothing but the dialog itself can take it off the screen.
    await page.viewport(1600, 900);
    const screen = await render(
      <StoryWrapper
        initialEntries={["/contacts/1/show"]}
        data={{
          companies: [buildCompany()],
          contacts: [buildContact({ company_id: 1 })],
          tasks: [
            {
              id: 1,
              contact_id: 1,
              sales_id: 0,
              type: "Premier contact",
              text: "Cadrage Acme",
              due_date: "2099-01-01T10:00:00.000Z",
            },
          ],
        }}
      >
        {null}
      </StoryWrapper>,
    );
    await screen.getByRole("button", { name: "meeting actions" }).click();
    await screen.getByRole("menuitem", { name: "Edit" }).click();
    const dialog = screen.getByRole("dialog", { name: "Edit meeting" });

    // Act
    await dialog.getByRole("link", { name: "Ada Lovelace" }).click();

    // Assert
    await expect.element(dialog).not.toBeInTheDocument();
  });
});
