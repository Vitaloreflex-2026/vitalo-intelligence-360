/**
 * Native color swatch, styled to sit next to the app's inputs.
 *
 * Form-free on purpose: the settings page binds it through `useInput`, while
 * the meeting-type list writes straight to the `choices` resource.
 */
export const ColorSwatchInput = ({
  value,
  onChange,
  onBlur,
  name,
  id,
  "aria-label": ariaLabel,
}: {
  value: string | null | undefined;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  "aria-label"?: string;
}) => (
  <input
    type="color"
    id={id}
    name={name}
    aria-label={ariaLabel}
    value={value || "#000000"}
    onChange={onChange}
    onBlur={onBlur}
    className="w-9 h-9 shrink-0 cursor-pointer appearance-none rounded border bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:cursor-pointer [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:cursor-pointer [&::-moz-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-none"
  />
);
