import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import assessmentsSampleCsv from "../dataImport/assessments_sample.csv?raw";
import { DataImportButton } from "../dataImport/DataImportButton";
import {
  buildCompany,
  buildContact,
  buildSale,
  StoryWrapper,
} from "@/test/StoryWrapper";
import { listAll, renderImport, runImport } from "@/test/importHarness";

// The mobile app registers no assessments screen, so the desktop layout is the
// one that offers to import them.
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));

import {
  ASSESSMENT_COLUMNS,
  deciderEmailColumn,
} from "./assessmentImportColumns";
import { DECIDER_ROLES } from "./concretizeChoices";
import { useAssessmentImport } from "./useAssessmentImport";

const importAssessments = renderImport.bind(null, useAssessmentImport);

describe("useAssessmentImport", () => {
  it("creates one assessment per row, reusing the company named by each", async () => {
    const { dataProvider, screen } = await importAssessments([
      { company: "Acme", created_at: "2026-09-16", urgency_level: "immediate" },
      { company: "Acme", next_action: "Rappeler la DRH" },
    ]);

    await runImport(screen);

    const { data: companies } = await listAll(dataProvider, "companies");
    expect(companies).toHaveLength(1);

    const { data: assessments } = await listAll(dataProvider, "assessments");
    expect(assessments).toHaveLength(2);
    expect(assessments[0]).toMatchObject({
      company_id: companies[0].id,
      created_at: "2026-09-16T00:00:00.000Z",
      urgency_level: "immediate",
    });
    expect(assessments[1]).toMatchObject({
      company_id: companies[0].id,
      next_action: "Rappeler la DRH",
    });
  });

  it("reads a checkbox group from one comma-separated cell", async () => {
    const { dataProvider, screen } = await importAssessments([
      {
        company: "Acme",
        priority_issues: "chronic_stress, Absenteeism, Jet lag",
        governance_owners: "hr_department",
      },
    ]);

    await runImport(screen);

    const { data: assessments } = await listAll(dataProvider, "assessments");
    // "Jet lag" is no option of the form, so it is dropped rather than stored
    expect(assessments[0].priority_issues).toEqual([
      "chronic_stress",
      "absenteeism",
    ]);
    expect(assessments[0].governance_owners).toEqual(["hr_department"]);
  });

  it("accepts either the stored value or the label shown in the form", async () => {
    const { dataProvider, screen } = await importAssessments([
      { company: "Acme", urgency_level: "3 to 6 months" },
    ]);

    await runImport(screen);

    const { data: assessments } = await listAll(dataProvider, "assessments");
    expect(assessments[0].urgency_level).toBe("three_to_six_months");
  });

  it("leaves a rating empty when it falls outside its scale", async () => {
    const { dataProvider, screen } = await importAssessments([
      {
        company: "Acme",
        impact_awareness: 3,
        // The IMPACT 360 dimensions are rated from 1 to 4, the opportunity from 1 to 5
        impact_management: 7,
        opportunity_rating: 5,
        overall_profile_level: 0,
      },
    ]);

    await runImport(screen);

    const { data: assessments } = await listAll(dataProvider, "assessments");
    expect(assessments[0]).toMatchObject({
      impact_awareness: 3,
      opportunity_rating: 5,
    });
    expect(assessments[0].impact_management).toBeUndefined();
    expect(assessments[0].overall_profile_level).toBeUndefined();
  });

  it("links each decider to a contact of the assessed company", async () => {
    const { dataProvider, screen } = await importAssessments(
      [
        {
          company: "Acme",
          decider_hr_email: "PAUL@acme.example",
          decider_hr_influence: "High",
          decider_management_email: "nobody@acme.example",
        },
      ],
      {
        companies: [buildCompany({ id: 1, name: "Acme" })],
        contacts: [
          buildContact({
            id: 10,
            company_id: 1,
            email_jsonb: [{ email: "paul@acme.example", type: "Work" }],
          }),
        ],
      },
    );

    await runImport(screen);

    const { data: assessments } = await listAll(dataProvider, "assessments");
    expect(assessments[0]).toMatchObject({
      company_id: 1,
      decider_hr_contact_id: 10,
      decider_hr_influence: "high",
    });
    // An email nobody carries never creates a contact, it leaves the role empty
    expect(assessments[0].decider_management_contact_id).toBeUndefined();
    const { data: contacts } = await listAll(dataProvider, "contacts");
    expect(contacts).toHaveLength(1);
  });

  it("reads the next steps table and resolves each owner among the team", async () => {
    const { dataProvider, screen } = await importAssessments(
      [
        {
          company: "Acme",
          next_steps:
            "Envoyer la proposition | marie@vitalo.example | 2026-10-15; Relancer la DRH || 2026-11-02",
          closed_by_email: "marie@vitalo.example",
        },
      ],
      { sales: [buildSale({ id: 7, email: "marie@vitalo.example" })] },
    );

    await runImport(screen);

    const { data: assessments } = await listAll(dataProvider, "assessments");
    expect(assessments[0].next_steps).toEqual([
      { action: "Envoyer la proposition", owner_id: 7, due_date: "2026-10-15" },
      { action: "Relancer la DRH", owner_id: null, due_date: "2026-11-02" },
    ]);
    expect(assessments[0].closed_by_id).toBe(7);
  });
});

describe("the assessment sample CSV", () => {
  it("imports through the dialog, as the downloaded template does", async () => {
    const screen = await render(
      <StoryWrapper>
        <DataImportButton resource="assessments" />
      </StoryWrapper>,
    );

    await screen.getByRole("button", { name: "Import CSV" }).click();
    await screen.getByLabelText("CSV File").upload(
      new File([assessmentsSampleCsv], "crm_assessments_sample.csv", {
        type: "text/csv",
      }),
    );
    await screen.getByRole("button", { name: "Start import" }).click();

    await expect
      .element(
        screen.getByText("Import complete. Imported 2 records, with 0 errors"),
      )
      .toBeVisible();
  });

  it("offers every column the importer reads", () => {
    const header = assessmentsSampleCsv.split("\n")[0].split(",");

    expect(new Set(header)).toEqual(
      new Set([
        "company",
        "created_at",
        "closed_by_email",
        "next_steps",
        ...DECIDER_ROLES.map(deciderEmailColumn),
        ...Object.keys(ASSESSMENT_COLUMNS),
      ]),
    );
  });
});
