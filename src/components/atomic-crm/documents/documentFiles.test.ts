import { describe, expect, it } from "vitest";

import type { Choice, SaleDocument } from "../types";
import { documentFileName, sanitizeFileName } from "./documentFiles";
import type { DocumentSlot } from "./saleDocumentStatus";

const buildSlot = (label: string, title: string): DocumentSlot => ({
  document: {
    created_at: "2026-09-01T09:00:00.000Z",
    file: { src: "https://files/x", title } as SaleDocument["file"],
    id: 1,
    sales_id: 1,
    type: label,
  },
  status: "valid",
  type: { category: "user_document_type", id: 1, label } as Choice,
});

describe("documentFileName", () => {
  it("names the file after the document type, keeping the extension", () => {
    // Arrange / Act
    const name = documentFileName(buildSlot("RIB", "scan_0012.pdf"));

    // Assert
    expect(name).toBe("RIB.pdf");
  });

  it("keeps a type name that contains no extension usable", () => {
    // Arrange / Act
    const name = documentFileName(buildSlot("Carte d'identité", "recto"));

    // Assert
    expect(name).toBe("Carte d'identité");
  });

  it("replaces characters a file system would reject", () => {
    // Arrange / Act
    const name = documentFileName(
      buildSlot("Attestation URSSAF 2026/2027", "a.pdf"),
    );

    // Assert
    expect(name).toBe("Attestation URSSAF 2026-2027.pdf");
  });
});

describe("sanitizeFileName", () => {
  it("strips every character forbidden in a file name", () => {
    // Arrange / Act
    const name = sanitizeFileName('a/b\\c:d*e?f"g<h>i|j');

    // Assert
    expect(name).toBe("a-b-c-d-e-f-g-h-i-j");
  });
});
