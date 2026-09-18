import type { Identifier } from "ra-core";

import { toIsoDate, toText } from "../dataImport/parseCell";
import type { ImportCell } from "../dataImport/types";
import type { AssessmentNextStep } from "../types";

/** One next step as the CSV spells it, before its owner email is resolved. */
export type NextStepDraft = {
  action?: string;
  ownerEmail?: string;
  dueDate?: string;
};

/**
 * Reads the `next_steps` cell, which packs a small table into one column:
 * steps are separated by `;`, and each names its action, the email of its owner
 * and its due date, separated by `|`:
 *
 *     Envoyer la proposition | marie@vitalo.fr | 2026-10-15; Relancer || 2026-11-02
 *
 * A comma would collide with the lists the other columns use, and an action
 * sentence is likely to contain one.
 */
export const parseNextStepDrafts = (cell: ImportCell): NextStepDraft[] =>
  (toText(cell)?.split(";") ?? [])
    .map((entry) => {
      const [action, ownerEmail, dueDate] = entry.split("|");
      return {
        action: toText(action),
        ownerEmail: toText(ownerEmail)?.toLowerCase(),
        // Inside jsonb there is no column to cast the value, so the day is
        // kept as the form's own date input writes it
        dueDate: toIsoDate(dueDate)?.slice(0, 10),
      };
    })
    .filter(({ action, ownerEmail, dueDate }) =>
      Boolean(action || ownerEmail || dueDate),
    );

/**
 * The next steps as the `next_steps` jsonb column stores them, or undefined
 * when the CSV listed none. An owner whose email matches nobody is left empty,
 * the same way the form leaves the select unset.
 */
export const toNextSteps = (
  drafts: NextStepDraft[],
  salesByEmail: Map<string, Identifier>,
): AssessmentNextStep[] | undefined =>
  drafts.length === 0
    ? undefined
    : drafts.map(({ action, ownerEmail, dueDate }) => ({
        action: action ?? null,
        owner_id: (ownerEmail && salesByEmail.get(ownerEmail)) || null,
        due_date: dueDate ?? null,
      }));
