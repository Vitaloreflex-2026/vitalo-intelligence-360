import { describe, expect, it } from "vitest";

import { toChoiceId, toChoiceIds } from "./parseChoice";

const LABELS: Record<string, string> = {
  "issues.chronic_stress": "Chronic stress",
  "issues.burnout": "Burnout",
  "issues.absenteeism": "Absenteeism",
};

const translate = (key: string) => LABELS[key] ?? key;

const issues = [
  { id: "chronic_stress", name: "issues.chronic_stress" },
  { id: "burnout", name: "issues.burnout" },
  { id: "absenteeism", name: "issues.absenteeism" },
];

describe("toChoiceId", () => {
  it("accepts the id the database stores", () => {
    expect(toChoiceId("burnout", issues, translate)).toBe("burnout");
  });

  it("accepts the label the form shows, whatever its case", () => {
    expect(toChoiceId("Chronic stress", issues, translate)).toBe(
      "chronic_stress",
    );
    expect(toChoiceId("  CHRONIC STRESS ", issues, translate)).toBe(
      "chronic_stress",
    );
  });

  it("returns undefined for an empty cell", () => {
    expect(toChoiceId(null, issues, translate)).toBeUndefined();
    expect(toChoiceId("   ", issues, translate)).toBeUndefined();
  });

  it("returns undefined for an answer the form has no option for", () => {
    expect(toChoiceId("Jet lag", issues, translate)).toBeUndefined();
  });
});

describe("toChoiceIds", () => {
  it("reads a comma-separated cell as several answers", () => {
    expect(toChoiceIds("burnout, Absenteeism", issues, translate)).toEqual([
      "burnout",
      "absenteeism",
    ]);
  });

  it("drops the answers the form has no option for", () => {
    expect(toChoiceIds("burnout, Jet lag", issues, translate)).toEqual([
      "burnout",
    ]);
  });

  it("keeps one entry per answer, however the CSV spells it", () => {
    expect(toChoiceIds("burnout, Burnout", issues, translate)).toEqual([
      "burnout",
    ]);
  });

  it("returns undefined rather than an empty list when nothing matches", () => {
    expect(toChoiceIds("Jet lag", issues, translate)).toBeUndefined();
    expect(toChoiceIds(null, issues, translate)).toBeUndefined();
  });
});
