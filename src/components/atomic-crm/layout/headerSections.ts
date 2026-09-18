import { matchPath } from "react-router";

export type HeaderSection = {
  to: string;
  label: string;
  options?: { smart_count?: number };
};

/**
 * The top-level sections of the desktop app, shared by the header tab bar and
 * the menu it collapses into on a narrow viewport, so the two can never list
 * different sections.
 */
export const HEADER_SECTIONS: HeaderSection[] = [
  { to: "/", label: "ra.page.dashboard" },
  {
    to: "/companies",
    label: "resources.companies.name",
    options: { smart_count: 2 },
  },
  {
    to: "/contacts",
    label: "resources.contacts.name",
    options: { smart_count: 2 },
  },
  {
    to: "/assessments",
    label: "resources.assessments.name",
    options: { smart_count: 2 },
  },
  {
    to: "/deals",
    label: "resources.deals.name",
    options: { smart_count: 2 },
  },
];

/** The section a pathname belongs to, or false when it is outside all of them. */
export const matchHeaderSection = (pathname: string): string | false => {
  if (matchPath("/", pathname)) {
    return "/";
  }
  const section = HEADER_SECTIONS.find(
    ({ to }) => to !== "/" && matchPath(`${to}/*`, pathname),
  );
  return section ? section.to : false;
};
