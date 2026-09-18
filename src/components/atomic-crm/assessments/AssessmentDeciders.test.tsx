import type { ReactNode } from "react";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router";
import { CoreAdminContext, CreateBase, Form } from "ra-core";
import fakeDataProvider from "ra-data-fakerest";

import { SaveButton } from "@/components/admin/form";

import { AssessmentDeciders } from "./AssessmentDeciders";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <CoreAdminContext
      dataProvider={fakeDataProvider({ assessments: [] })}
      i18nProvider={{
        // Render the last segment of the key, e.g. "…influence_levels.high".
        translate: (key) => key.split(".").pop() ?? key,
        changeLocale: () => Promise.resolve(),
        getLocale: () => "en",
      }}
    >
      {children}
    </CoreAdminContext>
  </MemoryRouter>
);

const DecidersForm = ({
  onSave,
  record,
}: {
  onSave?: (data: unknown) => void;
  record?: Record<string, unknown>;
}) => (
  <CreateBase resource="assessments" mutationOptions={{ onSuccess: onSave }}>
    <Form record={record}>
      <AssessmentDeciders />
      <SaveButton />
    </Form>
  </CreateBase>
);

describe("AssessmentDeciders", () => {
  it("lists one row per decision maker of the form", async () => {
    const screen = await render(<DecidersForm />, { wrapper: Wrapper });

    for (const role of ["management", "hr", "manager", "cse", "other"]) {
      await expect
        .element(screen.getByText(role, { exact: true }))
        .toBeVisible();
    }
  });

  it("stores the influence level of each row separately", async () => {
    const onSave = vi.fn();
    const screen = await render(<DecidersForm onSave={onSave} />, {
      wrapper: Wrapper,
    });

    await screen
      .getByRole("group", { name: "management" })
      .getByRole("radio", { name: "high" })
      .click();
    await screen
      .getByRole("group", { name: "hr" })
      .getByRole("radio", { name: "low" })
      .click();
    await screen.getByRole("button", { name: /save/i }).click();

    await expect.poll(() => onSave.mock.calls.length).toBeGreaterThan(0);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      decider_management_influence: "high",
      decider_hr_influence: "low",
    });
  });

  it("selects the influence level already stored on the record", async () => {
    const screen = await render(
      <DecidersForm record={{ id: 1, decider_cse_influence: "medium" }} />,
      { wrapper: Wrapper },
    );

    await expect
      .element(
        screen.getByRole("group", { name: "cse" }).getByRole("radio", {
          name: "medium",
        }),
      )
      .toBeChecked();
  });
});
