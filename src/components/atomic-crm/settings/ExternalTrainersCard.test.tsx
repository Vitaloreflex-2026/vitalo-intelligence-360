import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { StoryWrapper } from "@/test/StoryWrapper";

import type { Choice } from "../types";
import { ExternalTrainersCard } from "./ExternalTrainersCard";

const trainers: Choice[] = [
  { id: 1, category: "external_trainer", label: "Joëlle Fernandez" },
  { id: 2, category: "external_trainer", label: "Lauriane Forest" },
];

const renderCard = (choices: Choice[] = trainers) =>
  render(
    <StoryWrapper data={{ choices }}>
      <ExternalTrainersCard />
    </StoryWrapper>,
  );

describe("ExternalTrainersCard", () => {
  it("lists the trainers who have no account", async () => {
    const screen = await renderCard();

    await expect
      .element(screen.getByText("Joëlle Fernandez"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Lauriane Forest"))
      .toBeInTheDocument();
  });

  it("opens the user form for the chosen trainer", async () => {
    const screen = await renderCard();

    await expect
      .element(
        screen.getByRole("link", {
          name: "Create their account Joëlle Fernandez",
        }),
      )
      .toHaveAttribute("href", "/sales/create?external_trainer=1");
  });

  it("adds a trainer to the list", async () => {
    // Arrange
    const screen = await renderCard();

    // Act
    await screen.getByLabelText("First and last name").fill("Camille Martin");
    await screen.getByRole("button", { name: "Add" }).click();

    // Assert
    await expect
      .element(screen.getByText("Camille Martin"))
      .toBeInTheDocument();
  });

  it("says so when every trainer has an account", async () => {
    const screen = await renderCard([]);

    await expect
      .element(screen.getByText("No trainer without an account yet."))
      .toBeInTheDocument();
  });
});
