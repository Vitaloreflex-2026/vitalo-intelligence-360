import { describe, expect, it } from "vitest";
import { buildDeal, createCrmDb } from "@/test/StoryWrapper";

import { createDataProvider } from "../providers/fakerest";
import type { Deal } from "../types";
import { promoteExternalTrainer, splitTrainerName } from "./externalTrainers";

const providerWith = (deals: Deal[]) =>
  createDataProvider({
    db: createCrmDb({ deals }),
    latency: 0,
    silent: true,
  });

const getDeal = async (
  dataProvider: ReturnType<typeof providerWith>,
  id: number,
) => (await dataProvider.getOne<Deal>("deals", { id })).data;

describe("splitTrainerName", () => {
  it("takes the first word as first name and the rest as last name", () => {
    expect(splitTrainerName("Joëlle Fernandez")).toEqual({
      first_name: "Joëlle",
      last_name: "Fernandez",
    });
    expect(splitTrainerName("  Anne  de La Tour ")).toEqual({
      first_name: "Anne",
      last_name: "de La Tour",
    });
  });
});

describe("promoteExternalTrainer", () => {
  it("moves every contract naming the trainer onto their new account", async () => {
    // Arrange
    const dataProvider = providerWith([
      buildDeal({
        id: 1,
        trainer_ids: [3],
        external_trainers: ["Joëlle Fernandez", "Lauriane Forest"],
      }),
      buildDeal({ id: 2, external_trainers: ["Joëlle Fernandez"] }),
      buildDeal({ id: 3, external_trainers: ["Lauriane Forest"] }),
      buildDeal({ id: 4 }),
    ]);

    // Act
    const moved = await promoteExternalTrainer(dataProvider, {
      label: "Joëlle Fernandez",
      saleId: 9,
    });

    // Assert
    expect(moved).toBe(2);
    const [first, second, untouched] = await Promise.all([
      getDeal(dataProvider, 1),
      getDeal(dataProvider, 2),
      getDeal(dataProvider, 3),
    ]);
    expect(first.trainer_ids).toEqual([3, 9]);
    expect(first.external_trainers).toEqual(["Lauriane Forest"]);
    expect(second.trainer_ids).toEqual([9]);
    expect(second.external_trainers).toEqual([]);
    expect(untouched.trainer_ids).toBeUndefined();
    expect(untouched.external_trainers).toEqual(["Lauriane Forest"]);
  });

  it("does not list the account twice when it already trains the contract", async () => {
    // Arrange
    const dataProvider = providerWith([
      buildDeal({
        id: 1,
        trainer_ids: [9],
        external_trainers: ["Joëlle Fernandez"],
      }),
    ]);

    // Act
    await promoteExternalTrainer(dataProvider, {
      label: "Joëlle Fernandez",
      saleId: 9,
    });

    // Assert
    expect((await getDeal(dataProvider, 1)).trainer_ids).toEqual([9]);
  });
});
