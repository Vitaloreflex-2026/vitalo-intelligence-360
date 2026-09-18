import { CoreAdminContext, RecordContextProvider } from "ra-core";
import fakeDataProvider from "ra-data-fakerest";
import { MemoryRouter } from "react-router";
import { render } from "vitest-browser-react";

import type { Assessment } from "../types";
import { CompanyAssessmentProgress } from "./CompanyAssessmentProgress";

const company = { id: 1, name: "Acme" };

const renderProgress = (assessments: Partial<Assessment>[]) =>
  render(
    <MemoryRouter>
      <CoreAdminContext
        dataProvider={fakeDataProvider({ assessments })}
        i18nProvider={{
          // Render the last segment of the key, e.g. "…progress.not_started",
          // with the step count appended when the message interpolates one.
          translate: (key, options) =>
            [
              key.split(".").pop() ?? key,
              (options as { smart_count?: number })?.smart_count,
            ]
              .filter((part) => part != null)
              .join(" "),
          changeLocale: () => Promise.resolve(),
          getLocale: () => "en",
        }}
      >
        <RecordContextProvider value={company}>
          <CompanyAssessmentProgress />
        </RecordContextProvider>
      </CoreAdminContext>
    </MemoryRouter>,
  );

describe("CompanyAssessmentProgress", () => {
  it("shows an empty bar when the company has no assessment yet", async () => {
    const screen = await renderProgress([]);

    await expect
      .element(screen.getByRole("progressbar"))
      .toHaveAttribute("aria-valuenow", "0");
    await expect.element(screen.getByText("not_started")).toBeVisible();
  });

  it("shows an empty bar when the assessment holds no answer", async () => {
    const screen = await renderProgress([{ id: 1, company_id: 1 }]);

    await expect
      .element(screen.getByRole("progressbar"))
      .toHaveAttribute("aria-valuenow", "0");
    await expect.element(screen.getByText("not_started")).toBeVisible();
  });

  it("counts one third per answered step", async () => {
    const screen = await renderProgress([
      { id: 1, company_id: 1, urgency_level: "high" },
    ]);

    await expect
      .element(screen.getByRole("progressbar"))
      .toHaveAttribute("aria-valuenow", "33");
    await expect.element(screen.getByText("steps 1")).toBeVisible();
  });

  it("counts two thirds when two steps are answered", async () => {
    const screen = await renderProgress([
      {
        id: 1,
        company_id: 1,
        urgency_level: "high",
        support_objectives: ["prevent"],
      },
    ]);

    await expect
      .element(screen.getByRole("progressbar"))
      .toHaveAttribute("aria-valuenow", "66");
    await expect.element(screen.getByText("steps 2")).toBeVisible();
  });

  it("marks the assessment as complete when every step is answered", async () => {
    const screen = await renderProgress([
      {
        id: 1,
        company_id: 1,
        urgency_level: "high",
        support_objectives: ["prevent"],
        interview_summary: "Met the HR team",
      },
    ]);

    await expect
      .element(screen.getByRole("progressbar"))
      .toHaveAttribute("aria-valuenow", "100");
    await expect.element(screen.getByText("complete")).toBeVisible();
  });

  it("ignores empty answers and the company link when counting steps", async () => {
    const screen = await renderProgress([
      {
        id: 1,
        company_id: 1,
        diagnostic_summary: "",
        support_objectives: [],
        opportunity_rating: null,
      },
    ]);

    await expect
      .element(screen.getByRole("progressbar"))
      .toHaveAttribute("aria-valuenow", "0");
  });

  it("reads the latest assessment of the company", async () => {
    const screen = await renderProgress([
      {
        id: 1,
        company_id: 1,
        created_at: "2026-01-01T00:00:00Z",
        urgency_level: "high",
      },
      {
        id: 2,
        company_id: 1,
        created_at: "2026-02-01T00:00:00Z",
        urgency_level: "high",
        interview_summary: "Met the HR team",
      },
    ]);

    await expect
      .element(screen.getByRole("progressbar"))
      .toHaveAttribute("aria-valuenow", "66");
  });
});
