import { useResourceDefinitions } from "ra-core";

import { useAssessmentImport } from "../assessments/useAssessmentImport";
import type { ContactImportSchema } from "../contacts/useContactImport";
import { useContactImport } from "../contacts/useContactImport";
import assessmentsSampleCsv from "./assessments_sample.csv?raw";
import companiesSampleCsv from "./companies_sample.csv?raw";
import dealsSampleCsv from "./deals_sample.csv?raw";
import contactsSampleCsv from "../contacts/contacts_export.csv?raw";
import type { ImportableResource } from "./types";
import { useCompanyImport } from "./useCompanyImport";
import { useDealImport } from "./useDealImport";

/** Every resource a CSV can be imported into, in the order the dialog offers them. */
export const IMPORTABLE_RESOURCES = [
  "contacts",
  "companies",
  "deals",
  "assessments",
] as const;

export type ImportableResourceName = (typeof IMPORTABLE_RESOURCES)[number];

/**
 * The importable resources, restricted to those the running Admin registers:
 * an app that has no screen for a resource must not offer to import records
 * the user would never be able to see.
 */
export function useImportableResources(): ImportableResource[] {
  const processContacts = useContactImport();
  const processCompanies = useCompanyImport();
  const processDeals = useDealImport();
  const processAssessments = useAssessmentImport();
  const definitions = useResourceDefinitions();

  const resources: ImportableResource[] = [
    {
      name: "contacts",
      sampleCsv: contactsSampleCsv,
      textColumns: ["phone_work", "phone_home", "phone_other"],
      // The contact importer predates the shared ImportRow type and declares
      // its own all-string schema; it reads the same parsed cells.
      processBatch: (batch) => processContacts(batch as ContactImportSchema[]),
    },
    {
      name: "companies",
      sampleCsv: companiesSampleCsv,
      // These are text columns whose leading zero must survive the parsing:
      // a "02134" zipcode would otherwise be stored as 2134.
      textColumns: ["zipcode", "phone_number", "tax_identifier"],
      processBatch: processCompanies,
    },
    { name: "deals", sampleCsv: dealsSampleCsv, processBatch: processDeals },
    {
      name: "assessments",
      sampleCsv: assessmentsSampleCsv,
      processBatch: processAssessments,
    },
  ];

  return resources.filter(({ name }) => name in definitions);
}
