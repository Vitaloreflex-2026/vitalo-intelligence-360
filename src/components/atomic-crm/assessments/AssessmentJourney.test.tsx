import type { ReactNode } from "react";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router";
import { CoreAdminContext, CreateBase, Form } from "ra-core";
import fakeDataProvider from "ra-data-fakerest";

import { SaveButton } from "@/components/admin/form";

import {
  AssessmentJourneyInput,
  AssessmentRecommendedPath,
} from "./AssessmentJourney";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <CoreAdminContext
      dataProvider={fakeDataProvider({ assessments: [] })}
      i18nProvider={{
        // Render the last segment of the key, e.g. "…journey_steps.train".
        translate: (key) => key.split(".").pop() ?? key,
        changeLocale: () => Promise.resolve(),
        getLocale: () => "en",
      }}
    >
      {children}
    </CoreAdminContext>
  </MemoryRouter>
);

const JourneyForm = ({
  onSave,
  record,
}: {
  onSave?: (data: unknown) => void;
  record?: {
    id: number;
    journey_steps?: string[];
    recommended_path?: string[];
  };
}) => (
  <CreateBase resource="assessments" mutationOptions={{ onSuccess: onSave }}>
    <Form record={record}>
      <AssessmentJourneyInput />
      <AssessmentRecommendedPath />
      <SaveButton />
    </Form>
  </CreateBase>
);

describe("AssessmentJourney", () => {
  it("shows the six steps of the journey", async () => {
    const screen = await render(<JourneyForm />, { wrapper: Wrapper });

    for (const step of [
      "raise_awareness",
      "train",
      "deploy",
      "support",
      "measure",
      "sustain",
    ]) {
      await expect
        .element(screen.getByRole("checkbox", { name: step, exact: true }))
        .toBeVisible();
    }
  });

  it("ticks the steps already stored on the record", async () => {
    const screen = await render(
      <JourneyForm record={{ id: 1, journey_steps: ["deploy", "measure"] }} />,
      { wrapper: Wrapper },
    );

    await expect
      .element(screen.getByRole("checkbox", { name: "deploy", exact: true }))
      .toBeChecked();
    await expect
      .element(screen.getByRole("checkbox", { name: "train", exact: true }))
      .not.toBeChecked();
  });

  it("submits the journey and the recommended path separately", async () => {
    const onSave = vi.fn();
    const screen = await render(<JourneyForm onSave={onSave} />, {
      wrapper: Wrapper,
    });

    await screen.getByRole("checkbox", { name: "train", exact: true }).click();
    await screen
      .getByRole("checkbox", { name: "psmm_managers", exact: true })
      .click();
    await screen.getByRole("button", { name: /save/i }).click();

    await expect.poll(() => onSave.mock.calls.length).toBeGreaterThan(0);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      journey_steps: ["train"],
      recommended_path: ["psmm_managers"],
    });
  });

  it("unticks a step without touching the others", async () => {
    const onSave = vi.fn();
    const screen = await render(
      <JourneyForm
        onSave={onSave}
        record={{ id: 1, journey_steps: ["train", "measure"] }}
      />,
      { wrapper: Wrapper },
    );

    await screen.getByRole("checkbox", { name: "train", exact: true }).click();
    await screen.getByRole("button", { name: /save/i }).click();

    await expect.poll(() => onSave.mock.calls.length).toBeGreaterThan(0);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      journey_steps: ["measure"],
    });
  });
});
