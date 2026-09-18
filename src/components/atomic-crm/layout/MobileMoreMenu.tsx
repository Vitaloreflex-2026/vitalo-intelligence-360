import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Building,
  ClipboardList,
  Handshake,
  MoreHorizontal,
  Settings,
  User,
  Users,
} from "lucide-react";
import { CanAccess, useTranslate } from "ra-core";
import { useState } from "react";
import { Link, matchPath, useLocation } from "react-router";

/**
 * Routes the bottom bar has no room for. The five fixed slots cover the daily
 * loop (dashboard, contacts, create, tasks); everything else is reachable from
 * here, so no section of the app is mobile-only unreachable.
 */
const MORE_MENU_PATHS = [
  "/companies",
  "/assessments",
  "/deals",
  "/sales",
  "/profile",
  "/settings",
];

export const MobileMoreMenu = () => {
  const translate = useTranslate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // A section reached through this sheet still lights up its slot.
  const isActive = MORE_MENU_PATHS.some(
    (path) =>
      !!matchPath(path, location.pathname) ||
      !!matchPath(`${path}/*`, location.pathname),
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex-col gap-1 h-auto py-2 px-1 rounded-md w-16",
            isActive ? null : "text-muted-foreground",
          )}
          aria-label={translate("crm.navigation.more")}
        >
          <MoreHorizontal className="size-6" />
          <span className="text-[0.6rem] font-medium">
            {translate("crm.navigation.more")}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{translate("crm.navigation.more_title")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-8">
          <MoreMenuItem
            to="/companies"
            Icon={Building}
            label={translate("resources.companies.name", { smart_count: 2 })}
            onNavigate={close}
          />
          <MoreMenuItem
            to="/assessments"
            Icon={ClipboardList}
            label={translate("resources.assessments.name", { smart_count: 2 })}
            onNavigate={close}
          />
          <MoreMenuItem
            to="/deals"
            Icon={Handshake}
            label={translate("resources.deals.name", { smart_count: 2 })}
            onNavigate={close}
          />
          <CanAccess resource="sales" action="list">
            <MoreMenuItem
              to="/sales"
              Icon={Users}
              label={translate("resources.sales.name", { smart_count: 2 })}
              onNavigate={close}
            />
          </CanAccess>
          <MoreMenuItem
            to="/profile"
            Icon={User}
            label={translate("crm.profile.title")}
            onNavigate={close}
          />
          <MoreMenuItem
            to="/settings"
            Icon={Settings}
            label={translate("crm.settings.title")}
            onNavigate={close}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
};

const MoreMenuItem = ({
  to,
  Icon,
  label,
  onNavigate,
}: {
  to: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onNavigate: () => void;
}) => (
  <Button
    asChild
    variant="ghost"
    className="justify-start h-12 px-4 text-base gap-3"
  >
    <Link to={to} onClick={onNavigate}>
      <Icon className="size-5" />
      {label}
    </Link>
  </Button>
);
