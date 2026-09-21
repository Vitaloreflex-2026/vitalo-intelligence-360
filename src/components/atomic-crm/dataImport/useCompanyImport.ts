import { useCallback } from "react";
import { useDataProvider, useGetIdentity } from "ra-core";

import { mapSizeToCategory } from "../companies/sizes";
import { createEachRow } from "./createEachRow";
import { toBoolean, toIsoDate, toNumber, toText } from "./parseCell";
import type { ImportCell, ProcessImportBatch } from "./types";
import { toSaleId, useSaleEmailResolver } from "./useEmailResolver";

/**
 * Creates a company per CSV row. Unknown columns are ignored, missing ones are
 * left empty — except `name`, which the database requires. `sales_email` names
 * the consultant in charge among the team, and falls back to the user running
 * the import.
 */
export function useCompanyImport(): ProcessImportBatch {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const getSales = useSaleEmailResolver();

  return useCallback(
    async (batch) => {
      // One roundtrip per named consultant for the whole batch, not per row
      const sales = await getSales(
        batch.flatMap((row) => toText(row.sales_email) ?? []),
      );

      return createEachRow(
        batch.map((row) =>
          dataProvider.create("companies", {
            data: {
              name: toText(row.name),
              sector: toText(row.sector),
              size: sizeOf(row.size),
              linkedin_url: toText(row.linkedin_url),
              website: toText(row.website),
              phone_number: toText(row.phone_number),
              address: toText(row.address),
              zipcode: toText(row.zipcode),
              city: toText(row.city),
              state_abbr: toText(row.state_abbr),
              country: toText(row.country),
              description: toText(row.description),
              revenue: toText(row.revenue),
              tax_identifier: toText(row.tax_identifier),
              nb_sites: toNumber(row.nb_sites),
              nb_trainings_delivered: toNumber(row.nb_trainings_delivered),
              training_date: toIsoDate(row.training_date),
              quote_approved: toBoolean(row.quote_approved),
              service_invoiced: toBoolean(row.service_invoiced),
              sales_id: toSaleId(row.sales_email, sales) ?? identity?.id,
              created_at: new Date().toISOString(),
            },
          }),
        ),
      );
    },
    [dataProvider, getSales, identity?.id],
  );
}

/**
 * `size` is a bucket id, not a headcount, so an arbitrary CSV number is coerced
 * into the nearest bucket the company screens can render.
 */
const sizeOf = (cell: ImportCell) => {
  const size = toNumber(cell);
  return size === undefined ? undefined : mapSizeToCategory(size);
};
