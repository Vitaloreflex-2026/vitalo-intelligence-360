import type { DataProvider, Identifier } from "ra-core";

import type { Deal } from "../types";

/** `choices` category listing the trainers who have no CRM account. */
export const EXTERNAL_TRAINER_CATEGORY = "external_trainer";

/** "Joëlle Fernandez" -> first word as first name, the rest as last name. */
export const splitTrainerName = (label: string) => {
  const [firstName = "", ...lastName] = label.trim().split(/\s+/);
  return { first_name: firstName, last_name: lastName.join(" ") };
};

/**
 * A trainer listed by name just got a CRM account: every contract naming them
 * now points to that account instead. Returns how many contracts changed.
 */
export const promoteExternalTrainer = async (
  dataProvider: DataProvider,
  { label, saleId }: { label: string; saleId: Identifier },
): Promise<number> => {
  // Filtered client-side: a name can hold characters an array filter rejects.
  // ponytail: one page of 1000 contracts, paginate once there are more.
  const { data: deals } = await dataProvider.getList<Deal>("deals", {
    filter: { "external_trainers@not.is": null },
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "id", order: "ASC" },
  });
  const concerned = deals.filter((deal) =>
    deal.external_trainers?.includes(label),
  );

  await Promise.all(
    concerned.map((deal) =>
      dataProvider.update<Deal>("deals", {
        id: deal.id,
        data: {
          external_trainers: (deal.external_trainers ?? []).filter(
            (name) => name !== label,
          ),
          trainer_ids: [...new Set([...(deal.trainer_ids ?? []), saleId])],
        },
        previousData: deal,
      }),
    ),
  );
  return concerned.length;
};
