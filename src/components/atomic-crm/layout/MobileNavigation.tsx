import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslate } from "ra-core";
import { Link, useLocation } from "react-router";

import { HEADER_SECTIONS, matchHeaderSection } from "./headerSections";

/**
 * The mobile bottom bar. It lists the very same top-level sections as the
 * desktop header, so nothing the app offers is one tap away on one surface and
 * buried on the other. Creating a record and the secondary screens (tasks,
 * team, profile, settings) live in <MobileTopBar> instead.
 */
export const MobileNavigation = () => {
  const location = useLocation();
  const translate = useTranslate();
  const currentPath = matchHeaderSection(location.pathname);

  return (
    <nav
      aria-label={translate("crm.navigation.label")}
      // The bar sits on the device's bottom inset (the iOS home indicator)
      // rather than under it. env() reports the real value because index.html
      // asks for `viewport-fit=cover`; off a notched device it is simply 0.
      className="fixed bottom-0 left-0 right-0 z-50 bg-secondary pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-16 justify-center">
        {HEADER_SECTIONS.map(({ to, label, icon: Icon, options }) => (
          <Button
            key={to}
            asChild
            variant="ghost"
            className={cn(
              // Five slots share a screen as narrow as 360px
              "h-auto min-w-0 max-w-20 flex-1 flex-col gap-1 rounded-md px-0.5 py-1",
              currentPath === to ? null : "text-muted-foreground",
            )}
          >
            <Link
              to={to}
              aria-current={currentPath === to ? "page" : undefined}
            >
              <Icon className="size-6" />
              {/* A long label ("États des lieux") wraps rather than overflows */}
              <span className="line-clamp-2 text-center text-[0.6rem] leading-tight font-medium">
                {translate(label, options)}
              </span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
};
