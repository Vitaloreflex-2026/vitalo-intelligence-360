import { render } from "vitest-browser-react";

import { buildCompany, StoryWrapper } from "@/test/StoryWrapper";

import type { Assessment } from "../types";

// The list only exists on the desktop admin, and the test viewport is mobile-sized.
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));

const buildAssessment = (overrides: Partial<Assessment> = {}): Assessment =>
  ({
    company_id: 1,
    created_at: "2026-01-01T09:00:00.000Z",
    id: 1,
    ...overrides,
  }) as Assessment;

const renderList = (assessments: Assessment[]) =>
  render(
    <StoryWrapper
      data={{
        assessments,
        companies: [buildCompany({ id: 1, name: "Acme" })],
      }}
      initialEntries={["/assessments"]}
    >
      <></>
    </StoryWrapper>,
  );

describe("AssessmentList", () => {
  it("links each row to the company page", async () => {
    const screen = await renderList([buildAssessment()]);

    const link = screen.getByRole("link", { name: "Acme" });
    await expect.element(link).toBeVisible();
    expect(await link.element().getAttribute("href")).toBe("/companies/1/show");
  });

  it("has one column per answer step and none for the creation date", async () => {
    const screen = await renderList([buildAssessment()]);

    // The shadcn table styling drops the implicit columnheader role, so the
    // headers are matched by their text.
    for (const step of ["Diagnose", "Recommend", "Concretize"]) {
      await expect
        .element(screen.getByText(step, { exact: true }))
        .toBeVisible();
    }
    expect(
      screen.getByText("Created at", { exact: true }).elements(),
    ).toHaveLength(0);
  });

  it("marks a step as filled in as soon as it holds an answer", async () => {
    const screen = await renderList([
      buildAssessment({ urgency_level: "immediate" }),
    ]);

    await expect
      .element(screen.getByRole("row", { name: /Acme/ }))
      .toBeVisible();
    expect(
      screen.getByText("Filled in", { exact: true }).elements(),
    ).toHaveLength(1);
    expect(
      screen.getByText("Not filled in", { exact: true }).elements(),
    ).toHaveLength(2);
  });

  it("marks every step as filled in on a complete assessment", async () => {
    const screen = await renderList([
      buildAssessment({
        urgency_level: "immediate",
        support_objectives: ["raise_awareness"],
        interview_summary: "Met the HR team",
      }),
    ]);

    await expect
      .element(screen.getByRole("row", { name: /Acme/ }))
      .toBeVisible();
    expect(
      screen.getByText("Filled in", { exact: true }).elements(),
    ).toHaveLength(3);
    expect(
      screen.getByText("Not filled in", { exact: true }).elements(),
    ).toHaveLength(0);
  });
});
