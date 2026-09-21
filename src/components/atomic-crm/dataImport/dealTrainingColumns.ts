import type { Identifier, TranslateFunction } from "ra-core";

import {
  fundingTypes,
  qvctWorkshopTypes,
  trainingTypes,
} from "../deals/trainingOptions";
import { toChoiceId } from "./parseChoice";
import {
  toBoolean,
  toInteger,
  toIsoDate,
  toList,
  toNumber,
  toText,
} from "./parseCell";
import type { ImportRow } from "./types";
import { normalizeEmail } from "./useEmailResolver";

/**
 * The delivery half of an imported contract: what was taught, who funds it and
 * what was invoiced. Kept out of `useDealImport` because it is a flat mapping
 * of thirty columns, none of which the importer has to reason about.
 *
 * Every column is optional. A value the CRM cannot make sense of — an unknown
 * training type, an unreadable date — leaves its column empty rather than
 * storing something the form could not render back.
 */
export const toDealTrainingColumns = (
  row: ImportRow,
  translate: TranslateFunction,
  sales: Map<string, Identifier>,
) => ({
  trainer_ids: toTrainerIds(row.trainer_emails, sales),
  training_type: toChoiceId(row.training_type, trainingTypes, translate),
  nb_trained_managers: toInteger(row.nb_trained_managers),
  nb_trained_non_managers: toInteger(row.nb_trained_non_managers),
  hours_delivered: toNumber(row.hours_delivered),
  qvct_workshop_type: toChoiceId(
    row.qvct_workshop_type,
    qvctWorkshopTypes,
    translate,
  ),
  passport_eligible: toBoolean(row.passport_eligible),
  portal_data_sent: toBoolean(row.portal_data_sent),
  portal_data_sent_at: toIsoDate(row.portal_data_sent_at),
  qualiopi: toBoolean(row.qualiopi),
  funding_type: toChoiceId(row.funding_type, fundingTypes, translate),
  quote_signed: toBoolean(row.quote_signed),
  quote_signed_at: toIsoDate(row.quote_signed_at),
  agreement_signed: toBoolean(row.agreement_signed),
  agreement_signed_at: toIsoDate(row.agreement_signed_at),
  amount_invoiced_incl_tax: toNumber(row.amount_invoiced_incl_tax),
  cost_training: toNumber(row.cost_training),
  cost_teaching: toNumber(row.cost_teaching),
  cost_subcontracting: toNumber(row.cost_subcontracting),
  cost_travel: toNumber(row.cost_travel),
  cost_materials: toNumber(row.cost_materials),
  opco_name: toText(row.opco_name),
  opco_contact_name: toText(row.opco_contact_name),
  opco_contact_phone: toText(row.opco_contact_phone),
  opco_contact_email: toText(row.opco_contact_email),
  opco_file_submitted: toBoolean(row.opco_file_submitted),
  opco_file_submitted_at: toIsoDate(row.opco_file_submitted_at),
  appropriation_rate: toNumber(row.appropriation_rate),
  satisfaction_rate: toNumber(row.satisfaction_rate),
});

/** Every email address in the cell the team actually carries. */
export const toTrainerEmails = (row: ImportRow) =>
  toList(row.trainer_emails) ?? [];

/**
 * The consultants a `trainer_emails` cell names. Addresses nobody on the team
 * carries are dropped, exactly like the single `sales_email` column; an empty
 * cell leaves the column untouched rather than storing an empty array.
 */
const toTrainerIds = (
  cell: ImportRow[string],
  sales: Map<string, Identifier>,
) => {
  const ids = (toList(cell) ?? [])
    .map((email) => sales.get(normalizeEmail(email)))
    .filter((id): id is Identifier => id !== undefined);
  return ids.length > 0 ? ids : undefined;
};
