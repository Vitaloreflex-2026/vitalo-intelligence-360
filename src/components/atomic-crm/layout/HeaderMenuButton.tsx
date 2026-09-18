import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useTranslate } from "ra-core";
import { useState } from "react";
import { Link, useLocation } from "react-router";

import { HEADER_SECTIONS, matchHeaderSection } from "./headerSections";

/**
 * The header tab bar below `lg`, where the five tabs no longer fit next to the
 * logo and the user menu.
 */
export const HeaderMenuButton = () => {
  const translate = useTranslate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const currentPath = matchHeaderSection(location.pathname);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={translate("crm.navigation.label")}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>{translate("crm.navigation.label")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-8">
          {HEADER_SECTIONS.map(({ to, label, options }) => (
            <Button
              key={to}
              asChild
              variant="ghost"
              className={cn(
                "justify-start h-12 px-4 text-base",
                currentPath === to ? "bg-muted font-semibold" : null,
              )}
            >
              <Link
                to={to}
                onClick={() => setOpen(false)}
                aria-current={currentPath === to ? "page" : undefined}
              >
                {translate(label, options)}
              </Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
