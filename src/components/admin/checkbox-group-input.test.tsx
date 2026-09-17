import type { ReactNode } from "react";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router";
import { CoreAdminContext, CreateBase, Form } from "ra-core";
import fakeDataProvider from "ra-data-fakerest";

import { CheckboxGroupInput } from "@/components/admin/checkbox-group-input";
import { SaveButton } from "@/components/admin/form";

const CHOICES = [
  { id: "hr", name: "HR department" },
  { id: "managers", name: "Managers" },
  { id: "cse", name: "Works council" },
];

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

const OwnersForm = ({
  onSave,
  record,
}: {
  onSave?: (data: unknown) => void;
  record?: { id: number; owners: string[] };
}) => (
  <CreateBase resource="posts" mutationOptions={{ onSuccess: onSave }}>
    <Form record={record}>
      <CheckboxGroupInput source="owners" label="Owners" choices={CHOICES} />
      <SaveButton />
    </Form>
  </CreateBase>
);

describe("CheckboxGroupInput", () => {
  it("renders one checkbox per choice", async () => {
    const screen = await render(<OwnersForm />, { wrapper: Wrapper });

    await expect
      .element(screen.getByRole("checkbox", { name: "HR department" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("checkbox", { name: "Works council" }))
      .toBeVisible();
  });

  it("checks the boxes matching the values already stored", async () => {
    const screen = await render(
      <OwnersForm record={{ id: 1, owners: ["cse"] }} />,
      { wrapper: Wrapper },
    );

    await expect
      .element(screen.getByRole("checkbox", { name: "Works council" }))
      .toBeChecked();
    await expect
      .element(screen.getByRole("checkbox", { name: "Managers" }))
      .not.toBeChecked();
  });

  it("submits every checked value as an array", async () => {
    const onSave = vi.fn();
    const screen = await render(<OwnersForm onSave={onSave} />, {
      wrapper: Wrapper,
    });

    await screen.getByRole("checkbox", { name: "HR department" }).click();
    await screen.getByRole("checkbox", { name: "Managers" }).click();
    await screen.getByRole("button", { name: /save/i }).click();

    await expect.poll(() => onSave.mock.calls.length).toBeGreaterThan(0);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      owners: ["hr", "managers"],
    });
  });

  it("drops a value when its box is unchecked", async () => {
    const onSave = vi.fn();
    const screen = await render(
      <OwnersForm onSave={onSave} record={{ id: 1, owners: ["hr", "cse"] }} />,
      { wrapper: Wrapper },
    );

    await screen.getByRole("checkbox", { name: "HR department" }).click();
    await screen.getByRole("button", { name: /save/i }).click();

    await expect.poll(() => onSave.mock.calls.length).toBeGreaterThan(0);
    expect(onSave.mock.calls[0][0]).toMatchObject({ owners: ["cse"] });
  });
});
