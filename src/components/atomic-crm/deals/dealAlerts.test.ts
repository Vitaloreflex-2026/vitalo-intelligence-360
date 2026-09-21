import { describe, expect, it } from "vitest";

import type { Deal } from "../types";
import { getDealAlerts } from "./dealAlerts";

const buildDeal = (overrides: Partial<Deal> = {}): Deal =>
  ({
    id: 1,
    name: "Prévention TMS",
    expected_closing_date: "2026-06-30",
    ...overrides,
  }) as Deal;

const on = (date: string) => new Date(`${date}T09:00:00`);

describe("getDealAlerts", () => {
  it("returns no alert while every deadline is still ahead", () => {
    const deals = [buildDeal({ funding_type: "opco" })];

    expect(getDealAlerts(deals, on("2026-04-01"))).toEqual([]);
  });

  it("asks for the quote signature 30 days before the closing date", () => {
    const deals = [buildDeal()];

    const alerts = getDealAlerts(deals, on("2026-05-31"));

    expect(alerts).toHaveLength(1);
    expect(alerts[0].kind).toBe("quote_signed");
    expect(alerts[0].isOverdue).toBe(false);
  });

  it("marks the quote signature overdue the day after its deadline", () => {
    const deals = [buildDeal()];

    const alerts = getDealAlerts(deals, on("2026-06-01"));

    expect(alerts[0].isOverdue).toBe(true);
  });

  it("drops the quote alert once the quote is signed", () => {
    const deals = [buildDeal({ quote_signed: true })];

    expect(
      getDealAlerts(deals, on("2026-06-15")).map((alert) => alert.kind),
    ).not.toContain("quote_signed");
  });

  it("asks for the portal filing from the closing date, and flags it overdue after eight days", () => {
    const deals = [buildDeal({ quote_signed: true })];

    const inWindow = getDealAlerts(deals, on("2026-07-02"));
    expect(inWindow.map((alert) => alert.kind)).toEqual(["portal_data_sent"]);
    expect(inWindow[0].isOverdue).toBe(false);

    const late = getDealAlerts(deals, on("2026-07-09"));
    expect(late[0].isOverdue).toBe(true);
  });

  it("only asks for the OPCO submission when the OPCO funds the training", () => {
    const funded = [
      buildDeal({
        quote_signed: true,
        portal_data_sent: true,
        funding_type: "opco",
      }),
    ];
    const selfFunded = [
      buildDeal({
        quote_signed: true,
        portal_data_sent: true,
        funding_type: "cse",
      }),
    ];

    expect(
      getDealAlerts(funded, on("2026-07-01")).map((alert) => alert.kind),
    ).toEqual(["opco_file"]);
    expect(getDealAlerts(selfFunded, on("2026-07-01"))).toEqual([]);
  });

  it("ignores a contract that was lost — nothing is owed on it", () => {
    const deals = [buildDeal({ stage: "lost" })];

    expect(getDealAlerts(deals, on("2026-07-15"))).toEqual([]);
  });

  it("ignores archived contracts", () => {
    const deals = [buildDeal({ archived_at: "2026-06-30T00:00:00Z" })];

    expect(getDealAlerts(deals, on("2026-07-15"))).toEqual([]);
  });

  it("reads a plain YYYY-MM-DD closing date as a local day, not as UTC", () => {
    // Arrange — the quote deadline is exactly 2026-05-31 in the user's timezone
    const deals = [buildDeal({ expected_closing_date: "2026-06-30" })];

    // Act / Assert — a UTC reading would shift the deadline by a day
    expect(getDealAlerts(deals, on("2026-05-30"))).toEqual([]);
    expect(getDealAlerts(deals, on("2026-05-31"))).toHaveLength(1);
  });

  it("ignores a contract whose closing date is unusable", () => {
    const deals = [buildDeal({ expected_closing_date: "not a date" })];

    expect(getDealAlerts(deals, on("2026-07-15"))).toEqual([]);
  });
});
