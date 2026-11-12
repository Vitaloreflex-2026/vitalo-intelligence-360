import { MapPin } from "lucide-react";
import { FilterLiveForm, useListContext, useTranslate } from "ra-core";
import type { FormHTMLAttributes } from "react";
import { TextInput } from "@/components/admin/text-input";

import { ActiveFilterButton } from "../misc/ActiveFilterButton";
import { FilterCategory } from "./FilterCategory";

export interface LocationFilterProps {
  /** Filter key of the city, e.g. `city@ilike` */
  citySource: string;
  /** Filter key of the region, e.g. `state_abbr@ilike` */
  regionSource: string;
}

const CITY_LABEL = "resources.companies.fields.city";
const REGION_LABEL = "resources.companies.fields.state_abbr";

const StackedForm = (props: FormHTMLAttributes<HTMLFormElement>) => (
  <form className="flex w-full flex-col gap-2" {...props} />
);

/**
 * Free-text filters on a city and a region, applied as the user types.
 */
export const LocationFilter = ({
  citySource,
  regionSource,
}: LocationFilterProps) => {
  const translate = useTranslate();
  const cityLabel = translate(CITY_LABEL);
  const regionLabel = translate(REGION_LABEL);
  return (
    <FilterCategory
      icon={<MapPin className="h-4 w-4" />}
      label="crm.common.location"
    >
      <FilterLiveForm formComponent={StackedForm}>
        <TextInput
          source={citySource}
          label={false}
          helperText={false}
          placeholder={cityLabel}
          aria-label={cityLabel}
        />
        <TextInput
          source={regionSource}
          label={false}
          helperText={false}
          placeholder={regionLabel}
          aria-label={regionLabel}
        />
      </FilterLiveForm>
    </FilterCategory>
  );
};

/**
 * Removable chips for the active location filters.
 */
export const LocationFilterSummary = ({
  citySource,
  regionSource,
}: LocationFilterProps) => {
  const { filterValues } = useListContext();
  return (
    <>
      {[citySource, regionSource].map((source) =>
        filterValues?.[source] ? (
          <ActiveFilterButton
            key={source}
            className="w-auto justify-between h-8"
            label={
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filterValues[source]}
              </span>
            }
            value={{ [source]: filterValues[source] }}
          />
        ) : null,
      )}
    </>
  );
};
