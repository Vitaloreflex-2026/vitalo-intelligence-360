import type { Identifier } from "ra-core";
import { useGetList } from "ra-core";
import { useMemo } from "react";

import type { Choice, SaleDocument } from "../types";
import type { DocumentSlot } from "./saleDocumentStatus";
import {
  DOCUMENT_TYPE_CATEGORY,
  buildDocumentSlots,
} from "./saleDocumentStatus";

const MAX_DOCUMENT_TYPES = 100;

/** The papers every consultant is expected to file, in the admin's own order. */
export const useDocumentTypes = () =>
  useGetList<Choice>("choices", {
    filter: { category: DOCUMENT_TYPE_CATEGORY },
    pagination: { page: 1, perPage: MAX_DOCUMENT_TYPES },
    sort: { field: "id", order: "ASC" },
  });

/**
 * The documents one consultant filed, paired with the types expected of them.
 * RLS limits the read to the consultant themselves and to administrators, so
 * this returns an empty list rather than an error for anyone else.
 */
export const useSaleDocumentSlots = (
  salesId: Identifier | undefined,
): { slots: DocumentSlot[]; isPending: boolean } => {
  const { data: types, isPending: isPendingTypes } = useDocumentTypes();

  const { data: documents, isPending: isPendingDocuments } =
    useGetList<SaleDocument>(
      "sales_documents",
      {
        filter: { sales_id: salesId },
        pagination: { page: 1, perPage: MAX_DOCUMENT_TYPES },
        sort: { field: "id", order: "ASC" },
      },
      { enabled: salesId != null },
    );

  const slots = useMemo(
    () => buildDocumentSlots(types ?? [], documents ?? []),
    [types, documents],
  );

  return {
    slots,
    isPending: salesId == null || isPendingTypes || isPendingDocuments,
  };
};
