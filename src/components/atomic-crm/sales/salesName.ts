import type { Sale } from "../types";

/** Display name of a consultant/trainer, as shown in lists and legends. */
export const salesName = (sale: Sale): string =>
  `${sale.first_name} ${sale.last_name}`.trim();
