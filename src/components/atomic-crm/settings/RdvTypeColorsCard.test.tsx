import { useDataProvider, type DataProvider } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper } from "@/test/StoryWrapper";
import type { Choice } from "../types";
import { RdvTypeColorsCard } from "./RdvTypeColorsCard";

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

const buildMeetingTypes = (): Choice[] => [
  { id: 1, category: "rdv_type", label: "Premier contact", color: "#cfe3f7" },
  { id: 2, category: "rdv_type", label: "Bilan annuel", color: "#e2d9f3" },
  { id: 3, category: "rdv_mode", label: "Visioconférence", color: null },
];

describe("RdvTypeColorsCard", () => {
  it("lists one color picker per meeting type", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper data={{ choices: buildMeetingTypes() }}>
        <RdvTypeColorsCard />
      </StoryWrapper>,
    );

    // Assert
    await expect
      .element(screen.getByLabelText("Premier contact"))
      .toHaveValue("#cfe3f7");
    await expect
      .element(screen.getByLabelText("Bilan annuel"))
      .toHaveValue("#e2d9f3");
  });

  it("leaves the meeting modes out, they are not color-coded", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper data={{ choices: buildMeetingTypes() }}>
        <RdvTypeColorsCard />
      </StoryWrapper>,
    );

    // Assert
    await expect
      .element(screen.getByLabelText("Premier contact"))
      .toBeVisible();
    expect(screen.getByLabelText("Visioconférence").elements()).toHaveLength(0);
  });

  it("saves the new color when the picker closes", async () => {
    // Arrange
    let dataProvider: DataProvider | null = null;
    const DataProviderListener = () => {
      dataProvider = useDataProvider();
      return null;
    };

    const screen = await render(
      <StoryWrapper data={{ choices: buildMeetingTypes() }}>
        <DataProviderListener />
        <RdvTypeColorsCard />
      </StoryWrapper>,
    );
    const picker = screen.getByLabelText("Premier contact");
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
        const { data } = await dataProvider!.getOne<Choice>("choices", {
          id: 1,
        });
        return data.color;
      })
      .toBe("#ff8800");
  });

  it("shows a hint explaining that the colors drive the dashboard calendar", async () => {
    // Arrange & Act
    const screen = await render(
      <StoryWrapper data={{ choices: buildMeetingTypes() }}>
        <RdvTypeColorsCard />
      </StoryWrapper>,
    );

    // Assert
    await expect.element(screen.getByText(/dashboard calendar/i)).toBeVisible();
  });
});
