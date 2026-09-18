import { InfiniteListBase, useListContext, useTranslate } from "ra-core";
import { Link } from "react-router";

import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { InfinitePagination } from "../misc/InfinitePagination";
import { MobileListItems } from "../misc/MobileListItems";
import type { Company } from "../types";
import { CompanyAvatar } from "./CompanyAvatar";
import { CompanyEmpty } from "./CompanyEmpty";
import { CompanyListFilter } from "./CompanyListFilter";

/**
 * Companies on a phone: a flat scrollable list rather than the desktop card
 * grid, whose tiles leave only two per row and push the list off screen.
 */
export const CompanyListMobile = () => (
  <InfiniteListBase
    perPage={25}
    sort={{ field: "name", order: "ASC" }}
    queryOptions={{
      onError: () => {
        /* Disabled: <MobileListItems> renders the error with a retry */
      },
    }}
  >
    <CompanyListLayoutMobile />
  </InfiniteListBase>
);

const CompanyListLayoutMobile = () => {
  const { data, error, filterValues, isPending } = useListContext<Company>();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  // An app with no company at all gets the invitation to create one rather than
  // a search field filtering an empty list. A failed request also comes back
  // empty, so it is excluded here and handled by the retry below.
  if (!isPending && !error && !data?.length && !hasFilters)
    return <CompanyEmpty />;

  return (
    <div>
      <MobileHeader>
        <CompanyListFilter />
      </MobileHeader>
      <MobileContent>
        <MobileListItems<Company>
          renderItem={(company) => <CompanyItemMobile company={company} />}
          emptyText="resources.companies.empty.title"
          errorText="resources.companies.list.error_loading"
        />
        {!error && (
          <div className="flex justify-center">
            <InfinitePagination />
          </div>
        )}
      </MobileContent>
    </div>
  );
};

const CompanyItemMobile = ({ company }: { company: Company }) => {
  const translate = useTranslate();

  return (
    <Link
      to={`/companies/${company.id}/show`}
      className="flex flex-row items-center gap-4 py-3 transition-colors hover:bg-muted"
    >
      <CompanyAvatar record={company} width={40} height={40} />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{company.name}</div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {company.sector && <span>{company.sector}</span>}
          <span>
            {company.nb_contacts
              ? translate("resources.companies.nb_contacts", {
                  smart_count: company.nb_contacts,
                })
              : translate("resources.companies.no_contacts")}
            {" · "}
            {company.nb_deals
              ? translate("resources.companies.nb_deals", {
                  smart_count: company.nb_deals,
                })
              : translate("resources.companies.no_deals")}
          </span>
        </div>
      </div>
    </Link>
  );
};
