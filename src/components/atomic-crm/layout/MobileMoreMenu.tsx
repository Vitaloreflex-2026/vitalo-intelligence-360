import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ListTodo, Menu, Settings, User, Users } from "lucide-react";
import { CanAccess, useTranslate } from "ra-core";
import { useState } from "react";
import { Link } from "react-router";

/**
 * The screens that are not top-level sections: the bottom bar carries the five
 * sections the desktop header has, and everything else hangs off this menu so
 * it stays reachable from any page.
 */
export const MobileMoreMenu = () => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={translate("crm.navigation.more")}
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{translate("crm.navigation.more_title")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-8">
          <MoreMenuItem
            to="/tasks"
            Icon={ListTodo}
            label={translate("resources.tasks.name", { smart_count: 2 })}
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
    className="h-12 justify-start gap-3 px-4 text-base"
  >
    <Link to={to} onClick={onNavigate}>
      <Icon className="size-5" />
      {label}
    </Link>
  </Button>
);
