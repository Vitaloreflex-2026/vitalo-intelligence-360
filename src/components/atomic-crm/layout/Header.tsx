import { Settings, User, Users } from "lucide-react";
import { CanAccess, useTranslate, useUserMenu } from "ra-core";
import { Link, useLocation } from "react-router";
import { RefreshButton } from "@/components/admin/refresh-button";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { UserMenu } from "@/components/admin/user-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useConfigurationContext } from "../root/ConfigurationContext";
import { HeaderMenuButton } from "./HeaderMenuButton";
import { HEADER_SECTIONS, matchHeaderSection } from "./headerSections";

const Header = () => {
  const { darkModeLogo, title } = useConfigurationContext();
  const location = useLocation();
  const translate = useTranslate();

  const currentPath = matchHeaderSection(location.pathname);

  return (
    <>
      <nav className="grow">
        <header className="bg-vitalo-band text-white">
          <div className="px-4">
            <div className="flex justify-between items-center flex-1 gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 text-white no-underline min-w-0"
              >
                {/* The band is green in both themes: the white-bodied logo
                    is the one that reads on it. */}
                <img className="h-6" src={darkModeLogo} alt={title} />
                <h1 className="text-xl font-semibold truncate">{title}</h1>
              </Link>
              <div>
                {/*
                  The five tabs plus the logo and the user menu need about
                  950px; below `lg` they move into <HeaderMenuButton>. This
                  header only ever renders at >= 768px, since narrower
                  viewports get the mobile app and its bottom bar instead.
                */}
                <nav className="hidden lg:flex">
                  {HEADER_SECTIONS.map(({ to, label, options }) => (
                    <NavigationTab
                      key={to}
                      label={translate(label, options)}
                      to={to}
                      isActive={currentPath === to}
                    />
                  ))}
                </nav>
              </div>
              <div className="flex items-center shrink-0">
                <ThemeModeToggle />
                <RefreshButton />
                <UserMenu>
                  <ProfileMenu />
                  <CanAccess resource="sales" action="list">
                    <UsersMenu />
                  </CanAccess>
                  <CanAccess resource="configuration" action="edit">
                    <SettingsMenu />
                  </CanAccess>
                </UserMenu>
                <HeaderMenuButton />
              </div>
            </div>
          </div>
        </header>
      </nav>
    </>
  );
};

const NavigationTab = ({
  label,
  to,
  isActive,
}: {
  label: string;
  to: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    aria-current={isActive ? "page" : undefined}
    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
      isActive
        ? "text-white border-vitalo-orange"
        : "text-white/80 border-transparent hover:text-white"
    }`}
  >
    {label}
  </Link>
);

const UsersMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<UsersMenu> must be used inside <UserMenu?");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/sales" className="flex items-center gap-2">
        <Users />
        {translate("resources.sales.name", { smart_count: 2 })}
      </Link>
    </DropdownMenuItem>
  );
};

const ProfileMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ProfileMenu> must be used inside <UserMenu?");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/profile" className="flex items-center gap-2">
        <User />
        {translate("crm.profile.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const SettingsMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<SettingsMenu> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/settings" className="flex items-center gap-2">
        <Settings />
        {translate("crm.settings.title")}
      </Link>
    </DropdownMenuItem>
  );
};

export default Header;
