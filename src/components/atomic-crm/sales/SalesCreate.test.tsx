import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { StoryWrapper } from "@/test/StoryWrapper";

import { SalesCreate } from "./SalesCreate";

describe("SalesCreate", () => {
  it("prefills the name of the trainer the account replaces", async () => {
    // Arrange / Act
    const screen = await render(
      <StoryWrapper
        data={{
          choices: [
            { id: 5, category: "external_trainer", label: "Joëlle Fernandez" },
          ],
        }}
        initialEntries={["/?external_trainer=5"]}
      >
        <SalesCreate />
      </StoryWrapper>,
    );

    // Assert
    await expect
      .element(screen.getByText(/This account replaces Joëlle Fernandez/))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("textbox", { name: "First name" }))
      .toHaveValue("Joëlle");
    await expect
      .element(screen.getByRole("textbox", { name: "Last name" }))
      .toHaveValue("Fernandez");
  });
});
