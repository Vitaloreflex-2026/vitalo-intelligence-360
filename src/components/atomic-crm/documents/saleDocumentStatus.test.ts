import { describe, expect, it } from "vitest";

import type { Choice, SaleDocument } from "../types";
import {
  buildDocumentSlots,
  documentExpiryDate,
  documentStatus,
  isRenewalAlert,
  needsAttention,
} from "./saleDocumentStatus";

const NOW = new Date("2026-09-18T12:00:00.000Z");

const buildType = (overrides: Partial<Choice> = {}): Choice => ({
  category: "user_document_type",
  id: 1,
  label: "RIB",
  requires_renewal: false,
  ...overrides,
});

const buildDocument = (
  overrides: Partial<SaleDocument> = {},
): SaleDocument => ({
  created_at: "2026-09-01T09:00:00.000Z",
  file: {
    src: "https://files/rib.pdf",
    title: "rib.pdf",
  } as SaleDocument["file"],
  id: 10,
  sales_id: 1,
  type: "RIB",
  ...overrides,
});

describe("documentStatus", () => {
  it("reports a type with no file as missing", () => {
    // Arrange / Act
    const status = documentStatus(buildType(), undefined, NOW);

    // Assert
    expect(status).toBe("missing");
  });

  it("reports a filed document of a non-renewable type as valid, however old", () => {
    // Arrange
    const document = buildDocument({ created_at: "2015-01-01T09:00:00.000Z" });

    // Act
    const status = documentStatus(buildType(), document, NOW);

    // Assert
    expect(status).toBe("valid");
  });

  it("reports a renewable document filed over a year ago as expired", () => {
    // Arrange
    const type = buildType({ requires_renewal: true });
    const document = buildDocument({ created_at: "2025-09-01T09:00:00.000Z" });

    // Act
    const status = documentStatus(type, document, NOW);

    // Assert
    expect(status).toBe("expired");
  });

  it("warns a month ahead of the renewal deadline", () => {
    // Arrange
    const type = buildType({ requires_renewal: true });
    const document = buildDocument({ created_at: "2025-10-01T09:00:00.000Z" });

    // Act
    const status = documentStatus(type, document, NOW);

    // Assert
    expect(status).toBe("expiring");
  });

  it("stays valid while the renewal deadline is further away than a month", () => {
    // Arrange
    const type = buildType({ requires_renewal: true });
    const document = buildDocument({ created_at: "2026-06-01T09:00:00.000Z" });

    // Act
    const status = documentStatus(type, document, NOW);

    // Assert
    expect(status).toBe("valid");
  });
});

describe("documentExpiryDate", () => {
  it("falls one year after the day the document was filed", () => {
    // Arrange
    const type = buildType({ requires_renewal: true });
    const document = buildDocument({ created_at: "2026-03-05T09:00:00.000Z" });

    // Act
    const expiry = documentExpiryDate(type, document);

    // Assert
    expect(expiry?.toISOString()).toBe("2027-03-05T09:00:00.000Z");
  });

  it("has no expiry date for a type that never needs renewing", () => {
    // Arrange / Act
    const expiry = documentExpiryDate(buildType(), buildDocument());

    // Assert
    expect(expiry).toBeUndefined();
  });
});

describe("buildDocumentSlots", () => {
  it("lists every expected type, even the ones with no file", () => {
    // Arrange
    const types = [
      buildType({ id: 1, label: "RIB" }),
      buildType({ id: 2, label: "Carte d'identité" }),
    ];

    // Act
    const slots = buildDocumentSlots(types, [buildDocument()], NOW);

    // Assert
    expect(slots.map((slot) => [slot.type.label, slot.status])).toEqual([
      ["RIB", "valid"],
      ["Carte d'identité", "missing"],
    ]);
  });

  it("matches a document to its type by label", () => {
    // Arrange
    const types = [buildType({ id: 2, label: "Carte d'identité" })];
    const documents = [buildDocument({ type: "Carte d'identité" })];

    // Act
    const slots = buildDocumentSlots(types, documents, NOW);

    // Assert
    expect(slots[0].document).toBe(documents[0]);
  });

  it("ignores a document whose type is no longer expected", () => {
    // Arrange
    const documents = [buildDocument({ type: "Permis de conduire" })];

    // Act
    const slots = buildDocumentSlots([buildType()], documents, NOW);

    // Assert
    expect(slots).toHaveLength(1);
    expect(slots[0].document).toBeUndefined();
  });
});

describe("alert predicates", () => {
  it("asks for attention on anything but an up-to-date document", () => {
    // Arrange
    const types = [
      buildType({ id: 1, label: "RIB" }),
      buildType({ id: 2, label: "URSSAF", requires_renewal: true }),
    ];
    const documents = [
      buildDocument({ type: "RIB" }),
      buildDocument({
        created_at: "2020-01-01T09:00:00.000Z",
        id: 11,
        type: "URSSAF",
      }),
    ];

    // Act
    const slots = buildDocumentSlots(types, documents, NOW).filter(
      needsAttention,
    );

    // Assert
    expect(slots.map((slot) => slot.type.label)).toEqual(["URSSAF"]);
  });

  it("separates a deadline from a document that was never filed", () => {
    // Arrange
    const types = [
      buildType({ id: 1, label: "RIB" }),
      buildType({ id: 2, label: "URSSAF", requires_renewal: true }),
    ];
    const documents = [
      buildDocument({
        created_at: "2020-01-01T09:00:00.000Z",
        type: "URSSAF",
      }),
    ];

    // Act
    const slots = buildDocumentSlots(types, documents, NOW);

    // Assert
    expect(slots.filter(isRenewalAlert).map((slot) => slot.type.label)).toEqual(
      ["URSSAF"],
    );
    expect(
      slots
        .filter((slot) => slot.status === "missing")
        .map((s) => s.type.label),
    ).toEqual(["RIB"]);
  });
});
