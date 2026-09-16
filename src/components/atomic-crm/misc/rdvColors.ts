/**
 * Colors for meeting types.
 *
 * Meeting types are user-extensible rows of the `choices` referential, so no
 * color can be hardcoded per type: each row carries its own `color`, seeded by
 * the migration and editable in the settings page. This palette supplies those
 * seeds plus a stable fallback for a type created later without one.
 *
 * The hues are deliberately spread around the wheel instead of reusing
 * `tags/colors.ts`: in the dashboard calendar a meeting block is too narrow to
 * hold the type label, so the fill is the only thing telling one type from
 * another, and the tag pastels sit too close together to carry that.
 */
export const RDV_PALETTE = [
  "#cfe3f7", // blue
  "#ffe0b2", // amber
  "#d6f0d0", // green
  "#f7d6e0", // pink
  "#e2d9f3", // violet
  "#ffd8cc", // coral
  "#cfeceb", // teal
  "#e8e0cc", // sand
];

/** Ink used when a fill cannot be parsed, readable on any pastel. */
const NEUTRAL_INK = "#1f2937";

/** Minimum saturation and lightness of a derived ink, tuned for contrast. */
const INK_SATURATION = 0.45;
const INK_LIGHTNESS = 0.28;

/**
 * Stable index for a label, so a meeting type with no stored color keeps the
 * same fallback across reloads and across users.
 */
const hashLabel = (label: string): number => {
  let hash = 0;
  for (let index = 0; index < label.length; index++) {
    hash = (hash * 31 + label.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

/** Palette entry a meeting type falls back to when it has no stored color. */
export const fallbackRdvColor = (label: string): string =>
  RDV_PALETTE[hashLabel(label) % RDV_PALETTE.length];

type Rgb = { r: number; g: number; b: number };

const parseHex = (hex: string): Rgb | null => {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const digits =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : match[1];
  return {
    r: parseInt(digits.slice(0, 2), 16) / 255,
    g: parseInt(digits.slice(2, 4), 16) / 255,
    b: parseInt(digits.slice(4, 6), 16) / 255,
  };
};

const toHue = ({ r, g, b }: Rgb, max: number, delta: number): number => {
  if (delta === 0) return 0;
  if (max === r) return ((g - b) / delta) % 6;
  if (max === g) return (b - r) / delta + 2;
  return (r - g) / delta + 4;
};

const hslFromRgb = (rgb: Rgb): { h: number; s: number; l: number } => {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: (((toHue(rgb, max, delta) * 60) % 360) + 360) % 360, s, l };
};

const hexFromHsl = (h: number, s: number, l: number): string => {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const second = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const offset = l - chroma / 2;
  const sector = Math.floor(h / 60) % 6;
  const rgbBySector: Rgb[] = [
    { r: chroma, g: second, b: 0 },
    { r: second, g: chroma, b: 0 },
    { r: 0, g: chroma, b: second },
    { r: 0, g: second, b: chroma },
    { r: second, g: 0, b: chroma },
    { r: chroma, g: 0, b: second },
  ];
  const { r, g, b } = rgbBySector[sector];
  const toChannel = (value: number) =>
    Math.round((value + offset) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}`;
};

/**
 * Dark, saturated counterpart of a pastel fill, used for a meeting block's
 * text and left border. Derived rather than stored, so a color the user picks
 * themselves stays readable without asking them for a second one.
 */
export const rdvInkColor = (fill: string): string => {
  const rgb = parseHex(fill);
  if (!rgb) return NEUTRAL_INK;
  const { h, s } = hslFromRgb(rgb);
  return hexFromHsl(h, Math.max(s, INK_SATURATION), INK_LIGHTNESS);
};
