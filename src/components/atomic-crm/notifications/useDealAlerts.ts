import { useGetIdentity, useGetList } from "ra-core";
import { useMemo } from "react";

import type { DealAlert } from "../deals/dealAlerts";
import { getDealAlerts } from "../deals/dealAlerts";
import type { Deal } from "../types";

/** Bounded window of open contracts — enough to cover a year of activity. */
const MAX_DEALS = 200;

/**
 * The paperwork the signed-in consultant still owes on their own contracts:
 * an unsigned quote, a portal filing left undone, an OPCO file not submitted.
 */
export const useDealAlerts = (): DealAlert[] => {
  const { identity } = useGetIdentity();

  const { data: deals } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: MAX_DEALS },
      sort: { field: "expected_closing_date", order: "ASC" },
      filter: { sales_id: identity?.id, "archived_at@is": null },
    },
    { enabled: !!identity },
  );

  return useMemo(() => getDealAlerts(deals ?? []), [deals]);
};
