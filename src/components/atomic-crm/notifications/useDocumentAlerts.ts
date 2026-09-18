import { useGetIdentity } from "ra-core";
import { useMemo } from "react";

import type { DocumentSlot } from "../documents/saleDocumentStatus";
import {
  isRenewalAlert,
  needsAttention,
} from "../documents/saleDocumentStatus";
import { useSaleDocumentSlots } from "../documents/useSaleDocuments";

export type DocumentAlerts = {
  /** Filed papers that expire soon or already did — the urgent ones. */
  renewals: DocumentSlot[];
  /** Papers the consultant never filed. */
  missing: DocumentSlot[];
  count: number;
};

/** The signed-in consultant's own paperwork backlog, as the bell reports it. */
export const useDocumentAlerts = (): DocumentAlerts => {
  const { identity } = useGetIdentity();
  const { slots } = useSaleDocumentSlots(identity?.id);

  return useMemo(() => {
    const alerts = slots.filter(needsAttention);
    return {
      renewals: alerts.filter(isRenewalAlert),
      missing: alerts.filter((slot) => slot.status === "missing"),
      count: alerts.length,
    };
  }, [slots]);
};
