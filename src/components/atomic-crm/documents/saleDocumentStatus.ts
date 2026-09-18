import type { Choice, SaleDocument } from "../types";

/** `choices` category backing the list of papers every consultant must file. */
export const DOCUMENT_TYPE_CATEGORY = "user_document_type";

/** Renewable documents expire one year after the day they were filed. */
export const RENEWAL_PERIOD_YEARS = 1;

/** A renewal is announced this many days before the document actually expires. */
export const RENEWAL_WARNING_DAYS = 30;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type DocumentStatus = "missing" | "expired" | "expiring" | "valid";

/**
 * One expected document type paired with the file filed for it, if any — the
 * unit both the profile page and the notification panel render.
 */
export type DocumentSlot = {
  type: Choice;
  document?: SaleDocument;
  status: DocumentStatus;
  /** Only set for a filed document of a renewable type. */
  expiresAt?: Date;
};

/**
 * The day a filed document stops being accepted, or `undefined` when its type
 * never expires. Anchored on the upload date: filing the paper again restarts
 * the countdown, which is why re-uploading replaces the row instead of adding
 * one.
 */
export const documentExpiryDate = (
  type: Choice,
  document: SaleDocument | undefined,
): Date | undefined => {
  if (!type.requires_renewal || !document) return undefined;
  const expiry = new Date(document.created_at);
  if (Number.isNaN(expiry.getTime())) return undefined;
  expiry.setFullYear(expiry.getFullYear() + RENEWAL_PERIOD_YEARS);
  return expiry;
};

export const documentStatus = (
  type: Choice,
  document: SaleDocument | undefined,
  now: Date = new Date(),
): DocumentStatus => {
  if (!document) return "missing";
  const expiresAt = documentExpiryDate(type, document);
  if (!expiresAt) return "valid";
  const daysLeft = (expiresAt.getTime() - now.getTime()) / MILLISECONDS_PER_DAY;
  if (daysLeft <= 0) return "expired";
  if (daysLeft <= RENEWAL_WARNING_DAYS) return "expiring";
  return "valid";
};

/**
 * Pair every expected type with the document filed for it. Driven by the type
 * list, not by the filed documents, so a type nobody uploaded yet still shows
 * up — that absence is exactly what the notification panel reports.
 */
export const buildDocumentSlots = (
  types: Choice[],
  documents: SaleDocument[],
  now: Date = new Date(),
): DocumentSlot[] =>
  types.map((type) => {
    const document = documents.find(
      (candidate) => candidate.type === type.label,
    );
    return {
      type,
      document,
      status: documentStatus(type, document, now),
      expiresAt: documentExpiryDate(type, document),
    };
  });

/** Slots the user has something to do about — what the bell counts. */
export const needsAttention = (slot: DocumentSlot) => slot.status !== "valid";

/** Expiries are urgent in a way a never-filed document is not. */
export const isRenewalAlert = (slot: DocumentSlot) =>
  slot.status === "expired" || slot.status === "expiring";
