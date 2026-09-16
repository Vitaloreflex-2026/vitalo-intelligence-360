import type { Db } from "./types";

// Nothing to backfill for now: every generator produces self-contained records.
export const finalize = (_db: Db) => {};
