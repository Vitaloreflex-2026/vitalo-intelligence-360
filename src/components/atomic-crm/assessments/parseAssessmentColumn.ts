import type { TranslateFunction } from "ra-core";

import {
  toInteger,
  toIsoDate,
  toNumber,
  toText,
} from "../dataImport/parseCell";
import { toChoiceId, toChoiceIds } from "../dataImport/parseChoice";
import type { ImportCell } from "../dataImport/types";

import type { ColumnSpec } from "./assessmentImportColumns";

/** The value one assessment column takes, once its CSV cell is read. */
export type AssessmentValue = string | number | string[] | undefined;

/**
 * Reads one CSV cell into the value its assessment column stores. An empty or
 * unreadable cell yields `undefined`, which leaves the column untouched rather
 * than overwriting it with a wrong value.
 */
export const parseAssessmentColumn = (
  cell: ImportCell,
  spec: ColumnSpec,
  translate: TranslateFunction,
): AssessmentValue => {
  switch (spec.kind) {
    case "text":
      return toText(cell);
    case "amount":
      return toNumber(cell);
    case "date":
      return toIsoDate(cell);
    case "level": {
      const level = toInteger(cell);
      if (level === undefined) return undefined;
      return level >= spec.min && level <= spec.max ? level : undefined;
    }
    case "choice":
      return toChoiceId(cell, spec.choices, translate);
    case "choices":
      return toChoiceIds(cell, spec.choices, translate);
  }
};
