import type { TranslateFunction } from "ra-core";
import { describe, expect, it } from "vitest";

import { toDealTrainingColumns } from "./dealTrainingColumns";
import type { ImportRow } from "./types";

const LABELS: Record<string, string> = {
  "crm.training_type.collective": "Collectif",
  "crm.qvct_workshop_type.collective_onsite": "Collectif présentiel",
  "crm.funding_type.opco": "OPCO",
};

const translate = ((key: string) => LABELS[key] ?? key) as TranslateFunction;

const sales = new Map([
  ["marie@vitalo.fr", 1],
  ["paul@vitalo.fr", 2],
]);

const map = (row: ImportRow) => toDealTrainingColumns(row, translate, sales);

describe("toDealTrainingColumns", () => {
  it("leaves every column empty for a row that carries none of them", () => {
    // Arrange / Act
    const columns = map({ name: "Prévention TMS" });

    // Assert — an absent column must not overwrite what the CRM already holds
    expect(Object.values(columns).every((value) => value === undefined)).toBe(
      true,
    );
  });

  it("resolves the trainers named by email, and drops the unknown ones", () => {
    // Arrange / Act
    const columns = map({
      trainer_emails: "Marie@vitalo.fr, inconnu@ailleurs.fr, paul@vitalo.fr",
    });

    // Assert
    expect(columns.trainer_ids).toEqual([1, 2]);
  });

  it("leaves the trainers empty when no address matches the team", () => {
    expect(
      map({ trainer_emails: "inconnu@ailleurs.fr" }).trainer_ids,
    ).toBeUndefined();
  });

  it("accepts an option as its stored id or as the label users see", () => {
    // Arrange / Act
    const byId = map({ training_type: "collective", funding_type: "opco" });
    const byLabel = map({ training_type: "Collectif", funding_type: "OPCO" });

    // Assert
    expect(byId.training_type).toBe("collective");
    expect(byLabel.training_type).toBe("collective");
    expect(byLabel.funding_type).toBe("opco");
  });

  it("drops an option the form could not render back", () => {
    expect(map({ training_type: "Séminaire" }).training_type).toBeUndefined();
  });

  it("reads the yes/no answers and their dates", () => {
    // Arrange / Act
    const columns = map({
      quote_signed: "oui",
      quote_signed_at: "2026-08-20",
      portal_data_sent: "non",
      opco_file_submitted: "non",
    });

    // Assert
    expect(columns.quote_signed).toBe(true);
    expect(columns.quote_signed_at).toBe("2026-08-20T00:00:00.000Z");
    expect(columns.portal_data_sent).toBe(false);
    expect(columns.opco_file_submitted).toBe(false);
  });

  it("keeps the headcounts whole and the amounts decimal", () => {
    // Arrange / Act — a numeric column accepts cents, an integer column does not
    const columns = map({
      nb_trained_managers: "6.4",
      hours_delivered: "13.5",
      amount_invoiced_incl_tax: "14400.50",
      satisfaction_rate: "94",
    });

    // Assert
    expect(columns.nb_trained_managers).toBe(6);
    expect(columns.hours_delivered).toBe(13.5);
    expect(columns.amount_invoiced_incl_tax).toBe(14400.5);
    expect(columns.satisfaction_rate).toBe(94);
  });
});
