import { describe, expect, it } from "vitest";

import { RDV_PALETTE, fallbackRdvColor, rdvInkColor } from "./rdvColors";

/** Relative luminance per WCAG 2.1, used to check a fill/ink pair is readable. */
const luminance = (hex: string): number => {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (a: string, b: string): number => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

describe("fallbackRdvColor", () => {
  it("returns a palette color for a meeting type with no stored color", () => {
    // Arrange
    const label = "Atelier de cadrage";

    // Act
    const color = fallbackRdvColor(label);

    // Assert
    expect(RDV_PALETTE).toContain(color);
  });

  it("returns the same color every time for the same label", () => {
    // Arrange
    const label = "Rendez-vous de suivi";

    // Act
    const first = fallbackRdvColor(label);
    const second = fallbackRdvColor(label);

    // Assert
    expect(second).toBe(first);
  });

  it("spreads the seeded meeting types over several palette entries", () => {
    // Arrange
    const seededTypes = [
      "Premier contact",
      "Rendez-vous découverte",
      "Rendez-vous de suivi",
      "Restitution",
      "Bilan annuel",
    ];

    // Act
    const colors = new Set(seededTypes.map(fallbackRdvColor));

    // Assert — a hash that collapsed everything onto one color would make the
    // calendar unreadable, which is the whole point of the palette.
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe("rdvInkColor", () => {
  it.each(RDV_PALETTE)("stays readable on the %s fill", (fill) => {
    // Act
    const ink = rdvInkColor(fill);

    // Assert — WCAG AA for normal text.
    expect(contrastRatio(fill, ink)).toBeGreaterThanOrEqual(4.5);
  });

  it("reads a color the user picked without a leading hash", () => {
    // Act
    const ink = rdvInkColor("cfe3f7");

    // Assert
    expect(contrastRatio("#cfe3f7", ink)).toBeGreaterThanOrEqual(4.5);
  });

  it("expands a three-digit hex", () => {
    // Act
    const ink = rdvInkColor("#cdf");

    // Assert
    expect(contrastRatio("#ccddff", ink)).toBeGreaterThanOrEqual(4.5);
  });

  it("falls back to a readable neutral when the color is not a hex", () => {
    // Act
    const ink = rdvInkColor("rebeccapurple");

    // Assert
    expect(contrastRatio("#ffffff", ink)).toBeGreaterThanOrEqual(4.5);
  });
});
