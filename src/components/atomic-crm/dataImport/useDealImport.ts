import { useCallback } from "react";
import { useDataProvider, useGetIdentity } from "ra-core";

import { useCompanyResolver } from "./useCompanyResolver";
import { createEachRow } from "./createEachRow";
import { toIsoDate, toText } from "./parseCell";
import type { ImportCell, ProcessImportBatch } from "./types";

/** Splits a comma-separated CSV cell into the labels it lists. */
const toList = (cell: ImportCell) =>
  toText(cell)
    ?.split(",")
    .map((label) => label.trim())
    .filter(Boolean);

/**
 * Creates a deal per CSV row. Unknown columns are ignored, missing ones are
 * left empty. The `company` column holds a company name: matching companies are
 * reused, unknown ones are created.
 */
export function useDealImport(): ProcessImportBatch {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const getCompanies = useCompanyResolver();

  return useCallback(
    async (batch) => {
      const companyNames = batch
        .map((row) => toText(row.company))
        .filter((name): name is string => name !== undefined);
      const companies = await getCompanies(companyNames);

      const now = new Date().toISOString();
      return createEachRow(
        batch.map((row) => {
          const companyName = toText(row.company);
          return dataProvider.create("deals", {
            data: {
              company_id: companyName
                ? companies.get(companyName)?.id
                : undefined,
              contact_ids: [],
              reference: toText(row.reference),
              confidentiality: toText(row.confidentiality),
              origin: toText(row.origin),
              objectives: toList(row.objectives),
              motivation: toText(row.motivation),
              other_expectations: toText(row.other_expectations),
              expected_closing_date: toIsoDate(row.expected_closing_date),
              sales_id: identity?.id,
              created_at: now,
              updated_at: now,
            },
          });
        }),
      );
    },
    [dataProvider, getCompanies, identity?.id],
  );
}
