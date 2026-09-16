import { useDataProvider, type DataProvider } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper } from "@/test/StoryWrapper";
import type { Choice } from "../types";
import { RdvTypeColorsCard } from "./RdvTypeColorsCard";

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

    // Act — a native color input commits its value on change, then blurs when
    // the picker closes, which is when the row persists it.
    const element = picker.element() as HTMLInputElement;
    element.value = "#ff8800";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));

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
