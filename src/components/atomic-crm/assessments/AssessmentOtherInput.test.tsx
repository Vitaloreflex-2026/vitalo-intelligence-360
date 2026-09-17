import type { ReactNode } from "react";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router";
import { CoreAdminContext, CreateBase, Form } from "ra-core";
import fakeDataProvider from "ra-data-fakerest";

import { CheckboxGroupInput } from "@/components/admin/checkbox-group-input";
import { SaveButton } from "@/components/admin/form";

import { AssessmentOtherInput } from "./AssessmentOtherInput";
import { IDENTIFIED_BARRIER_CHOICES } from "./diagnosticChoices";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <CoreAdminContext
      dataProvider={fakeDataProvider({ assessments: [] })}
      i18nProvider={{
        translate: (key, options) => {
          if (typeof options?._ === "string") return options._;
          // Render the trailing segment of the key, e.g. "…identified_barriers.other".
          return key.split(".").pop() ?? key;
        },
        changeLocale: () => Promise.resolve(),
        getLocale: () => "en",
      }}
    >
      {children}
    </CoreAdminContext>
  </MemoryRouter>
);

const BarriersForm = ({
  onSave,
  record,
}: {
  onSave?: (data: unknown) => void;
  record?: {
    id: number;
    identified_barriers: string[];
    identified_barriers_other?: string;
  };
}) => (
  <CreateBase resource="assessments" mutationOptions={{ onSuccess: onSave }}>
    <Form record={record}>
      <CheckboxGroupInput
        source="identified_barriers"
        label={false}
        choices={IDENTIFIED_BARRIER_CHOICES}
      />
      <AssessmentOtherInput
        source="identified_barriers_other"
        group="identified_barriers"
      />
      <SaveButton />
    </Form>
  </CreateBase>
);

describe("AssessmentOtherInput", () => {
  it("disables the free-text field while the Other box is unticked", async () => {
    const screen = await render(<BarriersForm />, { wrapper: Wrapper });

    await expect
      .element(screen.getByLabelText("Identified barriers other"))
      .toBeDisabled();
  });

  it("enables the free-text field once the Other box is ticked", async () => {
    const screen = await render(<BarriersForm />, { wrapper: Wrapper });

    await screen.getByRole("checkbox", { name: "other" }).click();

    await expect
      .element(screen.getByLabelText("Identified barriers other"))
      .toBeEnabled();
  });

  it("empties the free-text field when the Other box is unticked", async () => {
    const screen = await render(<BarriersForm />, { wrapper: Wrapper });

    await screen.getByRole("checkbox", { name: "other" }).click();
    await screen.getByLabelText("Identified barriers other").fill("Legal risk");
    await screen.getByRole("checkbox", { name: "other" }).click();

    await expect
      .element(screen.getByLabelText("Identified barriers other"))
      .toHaveValue("");
  });

  it("keeps a value loaded with the Other box already ticked", async () => {
    const screen = await render(
      <BarriersForm
        record={{
          id: 1,
          identified_barriers: ["budget", "other"],
          identified_barriers_other: "Legal risk",
        }}
      />,
      { wrapper: Wrapper },
    );

    await expect
      .element(screen.getByLabelText("Identified barriers other"))
      .toHaveValue("Legal risk");
    await expect
      .element(screen.getByLabelText("Identified barriers other"))
      .toBeEnabled();
  });
});
