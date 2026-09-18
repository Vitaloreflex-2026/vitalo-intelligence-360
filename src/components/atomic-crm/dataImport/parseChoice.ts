import type { TranslateFunction } from "ra-core";

import { toList, toText } from "./parseCell";
import type { ImportCell } from "./types";

/**
 * A choice of the assessment form: the id is what the database stores, the name
 * is the i18n key of the label users tick on screen.
 */
export type ImportChoice = { id: string; name: string };

/**
 * Cell content matched against a choice list, so a CSV may carry either the
 * stored id (`chronic_stress`) or the label the form shows in the current
 * language (`Stress chronique`). Returns undefined when the cell is empty or
 * matches no choice — an unknown answer is dropped rather than stored raw,
 * because the form would have no option to render it on.
 */
export const toChoiceId = (
  cell: ImportCell,
  choices: ImportChoice[],
  translate: TranslateFunction,
): string | undefined => {
  const text = toText(cell);
  return text === undefined ? undefined : matchChoice(text, choices, translate);
};

/**
 * Comma-separated cell content matched against a choice list, for the `text[]`
 * columns the checkbox groups write. Returns undefined when no item matches, so
 * the column is left empty rather than set to an empty array.
 */
export const toChoiceIds = (
  cell: ImportCell,
  choices: ImportChoice[],
  translate: TranslateFunction,
): string[] | undefined => {
  const ids = (toList(cell) ?? [])
    .map((item) => matchChoice(item, choices, translate))
    .filter((id): id is string => id !== undefined);
  return ids.length > 0 ? [...new Set(ids)] : undefined;
};

const matchChoice = (
  text: string,
  choices: ImportChoice[],
  translate: TranslateFunction,
): string | undefined => {
  const needle = text.toLowerCase();
  return choices.find(
    ({ id, name }) =>
      id.toLowerCase() === needle ||
      translate(name, { _: name }).toLowerCase() === needle,
  )?.id;
};
