import { useListContext, useLocaleState, useTranslate } from "ra-core";
import { Link as RouterLink } from "react-router-dom";

import { formatRelativeDate } from "../misc/RelativeDate";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { findDealLabel } from "./dealUtils";

export const DealsIterator = () => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const { data: deals, error, isPending } = useListContext<Deal>();
  const { dealStages, dealCategories, currency } = useConfigurationContext();
  if (isPending || error) return null;
  return (
    <div>
      <div>
        {deals.map((deal) => (
          <div key={deal.id} className="p-0 text-sm">
            <RouterLink
              to={`/deals/${deal.id}/show`}
              className="flex items-center justify-between hover:bg-muted py-2 px-4 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium">{deal.name}</div>
                <div className="text-sm text-muted-foreground">
                  {findDealLabel(dealStages, deal.stage)},{" "}
                  {deal.amount.toLocaleString("en-US", {
                    notation: "compact",
                    style: "currency",
                    currency,
                    currencyDisplay: "narrowSymbol",
                    minimumSignificantDigits: 3,
                  })}
                  {deal.category
                    ? `, ${dealCategories.find((c) => c.value === deal.category)?.label ?? deal.category}`
                    : ""}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  {translate("crm.common.last_activity_with_date", {
                    date: formatRelativeDate(deal.updated_at, locale),
                  })}{" "}
                </div>
              </div>
            </RouterLink>
          </div>
        ))}
      </div>
    </div>
  );
};
