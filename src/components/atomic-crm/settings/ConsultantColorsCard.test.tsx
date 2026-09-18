import { useDataProvider, type DataProvider } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper, buildSale } from "@/test/StoryWrapper";
import type { Sale } from "../types";
import { ConsultantColorsCard } from "./ConsultantColorsCard";

/**
 * React installs its own `value` setter on the input to know when the value
 * changed; going through it is what makes the synthetic onChange fire.
 */
const setNativeValue = (element: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(element, value);
};

const buildTeam = (): Sale[] => [
  buildSale({
    id: 1,
    first_name: "Alice",
    last_name: "Martin",
    color: "#cfe3f7",
  }),
  buildSale({
    id: 2,
    first_name: "Bruno",
    last_name: "Petit",
    color: "#e2d9f3",
  }),
  buildSale({
    id: 3,
    first_name: "Chloé",
    last_name: "Roux",
    disabled: true,
    color: "#d6f0d0",
  }),
];

describe("ConsultantColorsCard", () => {
  it("lists one color picker per consultant", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper data={{ sales: buildTeam() }}>
        <ConsultantColorsCard />
      </StoryWrapper>,
    );

    // Assert
    await expect
      .element(screen.getByLabelText("Alice Martin"))
      .toHaveValue("#cfe3f7");
    await expect
      .element(screen.getByLabelText("Bruno Petit"))
      .toHaveValue("#e2d9f3");
  });

  it("leaves disabled consultants out, they hold no meeting any more", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper data={{ sales: buildTeam() }}>
        <ConsultantColorsCard />
      </StoryWrapper>,
    );

    // Assert
    await expect.element(screen.getByLabelText("Alice Martin")).toBeVisible();
    expect(screen.getByLabelText("Chloé Roux").elements()).toHaveLength(0);
  });

  it("falls back to a palette color for a consultant with none stored", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper
        data={{
          sales: [
            buildSale({
              id: 1,
              first_name: "Alice",
              last_name: "Martin",
              color: null,
            }),
          ],
        }}
      >
        <ConsultantColorsCard />
      </StoryWrapper>,
    );

    // Assert
    await expect
      .element(screen.getByLabelText("Alice Martin"))
      .toHaveValue("#f7d6e0");
  });

  it("saves the new color when the picker closes", async () => {
    // Arrange
    let dataProvider: DataProvider | null = null;
    const DataProviderListener = () => {
      dataProvider = useDataProvider();
      return null;
    };

    const screen = await render(
      <StoryWrapper data={{ sales: buildTeam() }}>
        <DataProviderListener />
        <ConsultantColorsCard />
      </StoryWrapper>,
    );
    const picker = screen.getByLabelText("Alice Martin");
    await expect.element(picker).toBeVisible();

    // Act — drive the input the way a real color picker does: React tracks the
    // value through its own setter, so assigning `.value` directly would be
    // ignored, and it listens for `focusout` rather than `blur`.
    const element = picker.element() as HTMLInputElement;
    setNativeValue(element, "#ff8800");
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));

    // Assert
    await expect
      .poll(async () => {
        const { data } = await dataProvider!.getOne<Sale>("sales", { id: 1 });
        return data.color;
      })
      .toBe("#ff8800");
  });

  it("shows a hint explaining that the colors drive the dashboard calendar", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper data={{ sales: buildTeam() }}>
        <ConsultantColorsCard />
      </StoryWrapper>,
    );

    // Assert
    await expect.element(screen.getByText(/dashboard calendar/i)).toBeVisible();
  });
});
