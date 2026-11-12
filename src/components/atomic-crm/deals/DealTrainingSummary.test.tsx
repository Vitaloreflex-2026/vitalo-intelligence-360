import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { RecordContextProvider } from "ra-core";
import { buildDeal, buildSale, StoryWrapper } from "@/test/StoryWrapper";

import type { Deal } from "../types";
import { DealTrainingSummary } from "./DealTrainingSummary";

const renderSummary = (deal: Deal) =>
  render(
    <StoryWrapper
      data={{
        deals: [deal],
        sales: [buildSale({ id: 7, first_name: "Marie", last_name: "Durand" })],
      }}
    >
      <RecordContextProvider value={deal}>
        <DealTrainingSummary record={deal} />
      </RecordContextProvider>
    </StoryWrapper>,
  );

describe("DealTrainingSummary", () => {
  it("lists the trainers without an account next to the ones who have one", async () => {
    // Arrange / Act
    const screen = await renderSummary(
      buildDeal({
        trainer_ids: [7],
        external_trainers: ["Joëlle Fernandez", "Lauriane Forest"],
      }),
    );

    // Assert
    await expect.element(screen.getByText("Marie Durand")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Joëlle Fernandez"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Lauriane Forest"))
      .toBeInTheDocument();
  });

  it("shows a contract whose only trainers have no account", async () => {
    // Arrange / Act
    const screen = await renderSummary(
      buildDeal({ external_trainers: ["Joëlle Fernandez"] }),
    );

    // Assert
    await expect
      .element(screen.getByText("Joëlle Fernandez"))
      .toBeInTheDocument();
  });
});
