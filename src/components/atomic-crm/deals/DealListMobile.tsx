import {
  InfiniteListBase,
  useGetIdentity,
  useListContext,
  useTranslate,
} from "ra-core";
import { Link, matchPath, useLocation } from "react-router";
import { NumberField } from "@/components/admin/number-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { InfinitePagination } from "../misc/InfinitePagination";
import { MobileListItems } from "../misc/MobileListItems";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { DealCreate } from "./DealCreate";
import { DealEdit } from "./DealEdit";
import { DealEmpty } from "./DealEmpty";
import { DealListFilter } from "./DealListFilter";
import { DealShow } from "./DealShow";

/**
 * Deals on a phone: a flat scrollable list rather than the desktop Kanban.
 * Dragging a card between columns needs horizontal room a phone does not have,
 * so the stage is shown as a badge on each row and moved from the deal page.
 */
export const DealListMobile = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <InfiniteListBase
      perPage={25}
      filter={{ "archived_at@is": null }}
      sort={{ field: "index", order: "DESC" }}
      queryOptions={{
        onError: () => {
          /* Disabled: <MobileListItems> renders the error with a retry */
        },
      }}
    >
      <DealListLayoutMobile />
    </InfiniteListBase>
  );
};

const DealListLayoutMobile = () => {
  const { data, error, filterValues, isPending } = useListContext<Deal>();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;
  // A deal is shown, edited and created in a dialog layered over the list, so
  // these routes are nested under it exactly as they are on the desktop.
  const location = useLocation();
  const matchCreate = matchPath("/deals/create", location.pathname);
  const matchShow = matchPath("/deals/:id/show", location.pathname);
  const matchEdit = matchPath("/deals/:id", location.pathname);

  // An app with no deal at all gets the invitation to create one rather than a
  // search field filtering an empty list. A failed request also comes back
  // empty, so it is excluded here and handled by the retry below.
  if (!isPending && !error && !data?.length && !hasFilters) {
    return (
      <DealEmpty>
        <DealShow open={!!matchShow} id={matchShow?.params.id} />
      </DealEmpty>
    );
  }

  return (
    <div>
      <MobileHeader>
        <DealListFilter />
      </MobileHeader>
      <MobileContent>
        <MobileListItems<Deal>
          renderItem={(deal) => <DealItemMobile deal={deal} />}
          emptyText="resources.deals.empty.title"
          errorText="resources.deals.list.error_loading"
        />
        {!error && (
          <div className="flex justify-center">
            <InfinitePagination />
          </div>
        )}
        <DealCreate open={!!matchCreate} />
        <DealEdit
          open={!!matchEdit && !matchCreate}
          id={matchEdit?.params.id}
        />
        <DealShow open={!!matchShow} id={matchShow?.params.id} />
      </MobileContent>
    </div>
  );
};

const DealItemMobile = ({ deal }: { deal: Deal }) => {
  const { currency, dealStages } = useConfigurationContext();
  const translate = useTranslate();
  const stage = dealStages.find(({ value }) => value === deal.stage);

  return (
    <Link
      to={`/deals/${deal.id}/show`}
      className="flex flex-row items-center gap-4 py-3 transition-colors hover:bg-muted"
    >
      <ReferenceField
        record={deal}
        source="company_id"
        reference="companies"
        link={false}
      >
        <CompanyAvatar width={40} height={40} />
      </ReferenceField>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium">{deal.name}</span>
          {stage && (
            <Badge variant="secondary" className="shrink-0 font-normal">
              {stage.label}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <ReferenceField
            record={deal}
            source="company_id"
            reference="companies"
            link={false}
          />
          {deal.amount != null && (
            <span>
              {translate("resources.deals.fields.amount")}
              {": "}
              <NumberField
                record={deal}
                source="amount"
                options={{
                  notation: "compact",
                  style: "currency",
                  currency,
                  currencyDisplay: "narrowSymbol",
                  minimumSignificantDigits: 3,
                }}
              />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
