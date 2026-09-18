import { useCallback } from "react";
import { useDataProvider, useTranslate, type Identifier } from "ra-core";

import { createEachRow } from "../dataImport/createEachRow";
import { toIsoDate, toText } from "../dataImport/parseCell";
import type { ImportRow, ProcessImportBatch } from "../dataImport/types";
import { useCompanyResolver } from "../dataImport/useCompanyResolver";
import {
  normalizeEmail,
  useCompanyContactResolver,
  useSaleEmailResolver,
} from "../dataImport/useEmailResolver";

import {
  ASSESSMENT_COLUMNS,
  deciderContactField,
  deciderEmailColumn,
} from "./assessmentImportColumns";
import { DECIDER_ROLES } from "./concretizeChoices";
import { parseAssessmentColumn } from "./parseAssessmentColumn";
import {
  parseNextStepDrafts,
  toNextSteps,
  type NextStepDraft,
} from "./parseAssessmentNextSteps";

/** One CSV row, with the values that need a lookup pulled out of it. */
type AssessmentImportRow = {
  row: ImportRow;
  companyName: string | undefined;
  /** Email of the contact filling each decider role named by the row */
  deciderEmails: Map<string, string>;
  closedByEmail: string | undefined;
  nextSteps: NextStepDraft[];
};

/**
 * Creates an assessment per CSV row. Unknown columns are ignored and missing
 * ones are left empty — except `company`, which the database requires: it holds
 * a company name, matching companies are reused and unknown ones are created.
 *
 * The columns naming people resolve against records that already exist and
 * never create anybody: deciders among the contacts of the assessed company,
 * `closed_by_email` and the owner of a next step among the team. An email
 * nobody carries leaves its column empty, as the form leaves an unset select.
 */
export function useAssessmentImport(): ProcessImportBatch {
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const getCompanies = useCompanyResolver();
  const getCompanyContacts = useCompanyContactResolver();
  const getSales = useSaleEmailResolver();

  return useCallback(
    async (batch) => {
      const rows: AssessmentImportRow[] = batch.map((row) => ({
        row,
        companyName: toText(row.company),
        deciderEmails: new Map(
          DECIDER_ROLES.flatMap((role) => {
            const email = toText(row[deciderEmailColumn(role)]);
            return email ? [[role, normalizeEmail(email)] as const] : [];
          }),
        ),
        closedByEmail: emailOf(row.closed_by_email),
        nextSteps: parseNextStepDrafts(row.next_steps),
      }));

      // One roundtrip per company and per team member for the whole batch,
      // rather than one per row
      const [companies, sales] = await Promise.all([
        getCompanies(
          rows
            .map(({ companyName }) => companyName)
            .filter((name): name is string => name !== undefined),
        ),
        getSales(
          rows.flatMap(({ closedByEmail, nextSteps }) => [
            ...(closedByEmail ? [closedByEmail] : []),
            ...nextSteps
              .map(({ ownerEmail }) => ownerEmail)
              .filter((email): email is string => email !== undefined),
          ]),
        ),
      ]);

      const companyIdOf = ({ companyName }: AssessmentImportRow) =>
        companyName ? companies.get(companyName)?.id : undefined;

      // Deciders are contacts of the assessed company, so their lookup waits
      // for the companies to be resolved
      const contactsByCompany = await getCompanyContacts(
        rows
          .filter(({ deciderEmails }) => deciderEmails.size > 0)
          .map(companyIdOf)
          .filter((id): id is Identifier => id !== undefined),
      );

      const now = new Date().toISOString();
      return createEachRow(
        rows.map((importRow) => {
          const { row, deciderEmails, closedByEmail, nextSteps } = importRow;
          const companyId = companyIdOf(importRow);
          const contacts = companyId
            ? contactsByCompany.get(companyId)
            : undefined;

          return dataProvider.create("assessments", {
            data: {
              ...Object.fromEntries(
                Object.entries(ASSESSMENT_COLUMNS).map(([column, spec]) => [
                  column,
                  parseAssessmentColumn(row[column], spec, translate),
                ]),
              ),
              company_id: companyId,
              ...Object.fromEntries(
                DECIDER_ROLES.map((role) => {
                  const email = deciderEmails.get(role);
                  return [
                    deciderContactField(role),
                    email ? contacts?.get(email) : undefined,
                  ];
                }),
              ),
              closed_by_id: closedByEmail
                ? sales.get(closedByEmail)
                : undefined,
              next_steps: toNextSteps(nextSteps, sales),
              created_at: toIsoDate(row.created_at) ?? now,
            },
          });
        }),
      );
    },
    [dataProvider, getCompanies, getCompanyContacts, getSales, translate],
  );
}

const emailOf = (cell: ImportRow[string]) => {
  const text = toText(cell);
  return text === undefined ? undefined : normalizeEmail(text);
};
