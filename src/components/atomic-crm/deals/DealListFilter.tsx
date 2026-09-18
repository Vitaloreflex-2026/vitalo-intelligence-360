import { Layers, Tag, Users } from "lucide-react";
import { useGetIdentity, useTranslate } from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { useIsMobile } from "@/hooks/use-mobile";

import { FilterCategory } from "../filters/FilterCategory";
import { ResponsiveFilters } from "../misc/ResponsiveFilters";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { AccountManagerFilter } from "../sales/AccountManagerInput";

const BUTTON_CLASS = "w-auto md:w-full justify-between h-10 md:h-8";

/**
 * Deal filters for the mobile list, which has no Kanban columns to stand in for
 * the stage. Same shape as the contact filters: a search field plus a sheet of
 * toggles.
 */
export const DealListFilter = () => {
  const { dealStages, dealCategories } = useConfigurationContext();
  const { identity } = useGetIdentity();
  const isMobile = useIsMobile();
  const translate = useTranslate();

  return (
    <ResponsiveFilters>
      <FilterCategory
        icon={<Layers className="h-4 w-4" />}
        label="resources.deals.fields.stage"
      >
        {dealStages.map((stage) => (
          <ToggleFilterButton
            key={stage.value}
            className={BUTTON_CLASS}
            label={stage.label}
            value={{ stage: stage.value }}
            size={isMobile ? "lg" : undefined}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Tag className="h-4 w-4" />}
        label="resources.deals.fields.category"
      >
        {dealCategories.map((category) => (
          <ToggleFilterButton
            key={category.value}
            className={BUTTON_CLASS}
            label={category.label}
            value={{ category: category.value }}
            size={isMobile ? "lg" : undefined}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Users className="h-4 w-4" />}
        label="resources.deals.fields.sales_id"
      >
        <ToggleFilterButton
          className={BUTTON_CLASS}
          label={translate("crm.common.me")}
          value={{ sales_id: identity?.id }}
          size={isMobile ? "lg" : undefined}
        />
        <AccountManagerFilter
          className={BUTTON_CLASS}
          size={isMobile ? "lg" : undefined}
        />
      </FilterCategory>
    </ResponsiveFilters>
  );
};
