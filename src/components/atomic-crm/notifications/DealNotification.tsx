import { useLocaleState, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PopoverClose } from "@/components/ui/popover";

import type { DealAlert } from "../deals/dealAlerts";
import { formatLocalizedDate } from "../misc/RelativeDate";

/**
 * One piece of contract paperwork still owed. The action opens the contract,
 * which is where the answer is recorded.
 */
export const DealNotification = ({ alert }: { alert: DealAlert }) => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">{alert.deal.name}</span>
          {alert.isOverdue ? (
            <Badge variant="destructive">
              {translate("crm.deal_alerts.overdue")}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {translate(`crm.deal_alerts.kinds.${alert.kind}`)} —{" "}
          {translate("crm.deal_alerts.due_on", {
            date: formatLocalizedDate(alert.dueDate.toISOString(), locale),
          })}
        </p>
      </div>

      <PopoverClose asChild>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="shrink-0 cursor-pointer"
        >
          <Link to={`/deals/${alert.deal.id}/show`}>
            {translate("crm.deal_alerts.actions.open")}
          </Link>
        </Button>
      </PopoverClose>
    </div>
  );
};
