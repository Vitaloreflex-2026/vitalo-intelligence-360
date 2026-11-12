import { Building, Truck, Users } from "lucide-react";
import {
  FilterLiveForm,
  useGetIdentity,
  useGetList,
  useTranslate,
} from "ra-core";
import type { FormHTMLAttributes } from "react";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { useIsMobile } from "@/hooks/use-mobile";

import { FilterCategory } from "../filters/FilterCategory";
import { ResponsiveFilters } from "../misc/ResponsiveFilters";
import type { Choice } from "../types";
import { AccountManagerFilter } from "../sales/AccountManagerInput";
import { getTranslatedCompanySizeLabel } from "./getTranslatedCompanySizeLabel";
import { sizes } from "./sizes";

const FullWidthForm = (props: FormHTMLAttributes<HTMLFormElement>) => (
  <form className="w-full" {...props} />
);

export const CompanyListFilter = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const isMobile = useIsMobile();
  const { data: sectors } = useGetList<Choice>("choices", {
    filter: { category: "company_sector" },
    pagination: { page: 1, perPage: 200 },
    sort: { field: "id", order: "ASC" },
  });
  const translatedSizes = sizes.map((size) => ({
    ...size,
    name: getTranslatedCompanySizeLabel(size, translate),
  }));
  return (
    <ResponsiveFilters>
      <FilterCategory
        icon={<Building className="h-4 w-4" />}
        label="resources.companies.fields.size"
      >
        {translatedSizes.map((size) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={size.name}
            key={size.name}
            value={{ size: size.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Truck className="h-4 w-4" />}
        label="resources.companies.fields.sector"
      >
        {/* A dropdown rather than one button per sector: the list is
            user-extensible and grows too long for the sidebar. */}
        <FilterLiveForm formComponent={FullWidthForm} debounce={0}>
          <AutocompleteInput
            source="sector"
            // minmax(0, 1fr) track: lets a long sector truncate instead of
            // widening the field past the sidebar.
            className="grid-cols-1"
            choices={sectors ?? []}
            optionText="label"
            optionValue="label"
            translateChoice={false}
            label={false}
            helperText={false}
            clearable
            modal={isMobile}
            placeholder={translate("resources.companies.fields.sector")}
            inputText={(sector?: Choice) => (
              <span className="min-w-0 truncate">{sector?.label}</span>
            )}
          />
        </FilterLiveForm>
      </FilterCategory>

      <FilterCategory
        icon={<Users className="h-4 w-4" />}
        label="resources.companies.fields.sales_id"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.common.me")}
          value={{ sales_id: identity?.id }}
        />
        <AccountManagerFilter className="w-full justify-between" />
      </FilterCategory>
    </ResponsiveFilters>
  );
};
