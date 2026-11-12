import { MapPin } from "lucide-react";
import {
  FilterLiveForm,
  useGetList,
  useListContext,
  useTranslate,
} from "ra-core";
import type { FormHTMLAttributes } from "react";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { useIsMobile } from "@/hooks/use-mobile";

import { ActiveFilterButton } from "../misc/ActiveFilterButton";
import type { Company } from "../types";
import { FilterCategory } from "./FilterCategory";

export interface LocationFilterProps {
  /** Filter key of the city, e.g. `city@ilike` */
  citySource: string;
  /** Filter key of the region, e.g. `state_abbr@ilike` */
  regionSource: string;
}

const CITY_LABEL = "resources.companies.fields.city";
const REGION_LABEL = "resources.companies.fields.state_abbr";

// ponytail: loads every company to list the known locations client-side; move
// to a distinct-values view if the company count grows into the thousands.
const MAX_COMPANIES = 1000;

const toChoices = (values: (string | null | undefined)[]) =>
  [...new Set(values.flatMap((value) => value?.trim() || []))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ id: value, name: value }));

const StackedForm = (props: FormHTMLAttributes<HTMLFormElement>) => (
  <form className="flex w-full flex-col gap-2" {...props} />
);

/**
 * Filters on a city and a region, picked among the locations of the companies.
 */
export const LocationFilter = ({
  citySource,
  regionSource,
}: LocationFilterProps) => {
  const translate = useTranslate();
  const isMobile = useIsMobile();
  const { data: companies = [] } = useGetList<Company>("companies", {
    pagination: { page: 1, perPage: MAX_COMPANIES },
  });
  const inputs = [
    {
      source: citySource,
      label: translate(CITY_LABEL),
      choices: toChoices(companies.map((company) => company.city)),
    },
    {
      source: regionSource,
      label: translate(REGION_LABEL),
      choices: toChoices(companies.map((company) => company.state_abbr)),
    },
  ];
  return (
    <FilterCategory
      icon={<MapPin className="h-4 w-4" />}
      label="crm.common.location"
    >
      <FilterLiveForm formComponent={StackedForm}>
        {inputs.map(({ source, label, choices }) => (
          <AutocompleteInput
            key={source}
            source={source}
            choices={choices}
            translateChoice={false}
            label={false}
            helperText={false}
            clearable
            modal={isMobile}
            placeholder={label}
          />
        ))}
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
