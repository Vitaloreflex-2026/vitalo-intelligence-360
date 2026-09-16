import type { ReactNode } from "react";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router";
import { CoreAdminContext, CreateBase, required } from "ra-core";
import fakeDataProvider from "ra-data-fakerest";

import { TextInput } from "@/components/admin/text-input";
import { WizardForm, WizardFormStep } from "@/components/admin/wizard-form";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <CoreAdminContext
      dataProvider={fakeDataProvider({ posts: [] })}
      i18nProvider={{
        translate: (key, options) =>
          typeof options?._ === "string" ? options._ : key,
        changeLocale: () => Promise.resolve(),
        getLocale: () => "en",
      }}
    >
      {children}
    </CoreAdminContext>
  </MemoryRouter>
);

const TwoStepForm = ({ onSave }: { onSave?: (data: unknown) => void }) => (
  <CreateBase resource="posts" mutationOptions={{ onSuccess: onSave }}>
    <WizardForm>
      <WizardFormStep label="Identity">
        <TextInput source="title" validate={required()} />
      </WizardFormStep>
      <WizardFormStep label="Content">
        <TextInput source="body" />
      </WizardFormStep>
    </WizardForm>
  </CreateBase>
);

describe("WizardForm", () => {
  it("shows only the inputs of the current step", async () => {
    const screen = await render(<TwoStepForm />, { wrapper: Wrapper });

    await expect.element(screen.getByLabelText(/title/i)).toBeVisible();
    await expect
      .element(screen.getByLabelText(/body/i))
      .not.toBeInTheDocument();
  });

  it("offers Next instead of Save until the last step", async () => {
    const screen = await render(<TwoStepForm />, { wrapper: Wrapper });

    await expect
      .element(screen.getByRole("button", { name: "Next" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .not.toBeInTheDocument();
  });

  it("stays on the step when a required input of that step is empty", async () => {
    const screen = await render(<TwoStepForm />, { wrapper: Wrapper });

    await screen.getByRole("button", { name: "Next" }).click();

    await expect.element(screen.getByLabelText(/title/i)).toBeVisible();
    await expect
      .element(screen.getByLabelText(/body/i))
      .not.toBeInTheDocument();
  });

  it("moves to the next step once the current one is valid", async () => {
    const screen = await render(<TwoStepForm />, { wrapper: Wrapper });

    await screen.getByLabelText(/title/i).fill("Ada");
    await screen.getByRole("button", { name: "Next" }).click();

    await expect.element(screen.getByLabelText(/body/i)).toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeVisible();
  });

  it("restores the values already entered when going back", async () => {
    const screen = await render(<TwoStepForm />, { wrapper: Wrapper });

    await screen.getByLabelText(/title/i).fill("Ada");
    await screen.getByRole("button", { name: "Next" }).click();
    await screen.getByRole("button", { name: "Previous" }).click();

    await expect.element(screen.getByLabelText(/title/i)).toHaveValue("Ada");
  });

  it("submits the values of every step together", async () => {
    const onSave = vi.fn();
    const screen = await render(<TwoStepForm onSave={onSave} />, {
      wrapper: Wrapper,
    });

    await screen.getByLabelText(/title/i).fill("Ada");
    await screen.getByRole("button", { name: "Next" }).click();
    await screen.getByLabelText(/body/i).fill("Lovelace");
    await screen.getByRole("button", { name: /save/i }).click();

    await expect.poll(() => onSave.mock.calls.length).toBeGreaterThan(0);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      title: "Ada",
      body: "Lovelace",
    });
  });

  it("hides the step indicator when there is a single step", async () => {
    const screen = await render(
      <CreateBase resource="posts">
        <WizardForm>
          <WizardFormStep label="Identity">
            <TextInput source="title" />
          </WizardFormStep>
        </WizardForm>
      </CreateBase>,
      { wrapper: Wrapper },
    );

    await expect.element(screen.getByLabelText(/title/i)).toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeVisible();
    await expect.element(screen.getByRole("listitem")).not.toBeInTheDocument();
  });
});
