import { useLocaleState } from "ra-core";

/** Formats a filing or expiry date in the locale the user picked in the app. */
export const useFormatDocumentDate = () => {
  const [locale] = useLocaleState();
  return (date: Date | string) =>
    new Date(date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
};
