import { Building, ClipboardList, Handshake, Home, Users } from "lucide-react";
import { matchPath } from "react-router";

export type HeaderSection = {
  to: string;
  label: string;
  /** Used by the mobile bottom bar; the desktop tab bar shows labels only. */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  options?: { smart_count?: number };
};

/**
 * The top-level sections of the app, shared by the desktop header tab bar, the
 * menu it collapses into on a narrow viewport, and the mobile bottom bar — so
 * the three can never offer different sections.
 */
export const HEADER_SECTIONS: HeaderSection[] = [
  { to: "/", label: "ra.page.dashboard", icon: Home },
  {
    to: "/companies",
    label: "resources.companies.name",
    icon: Building,
    options: { smart_count: 2 },
  },
  {
    to: "/contacts",
    label: "resources.contacts.name",
    icon: Users,
    options: { smart_count: 2 },
  },
  {
    to: "/assessments",
    label: "resources.assessments.name",
    icon: ClipboardList,
    options: { smart_count: 2 },
  },
  {
    to: "/deals",
    label: "resources.deals.name",
    icon: Handshake,
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
