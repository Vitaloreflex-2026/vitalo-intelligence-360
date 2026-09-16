import {
  useCanAccess,
  useGetIdentity,
  useListContext,
  useTranslate,
} from "ra-core";
import { matchPath, useLocation } from "react-router";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { DateField } from "@/components/admin/date-field";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceInput } from "@/components/admin/reference-input";
import { FilterButton } from "@/components/admin/filter-form";
import { SearchInput } from "@/components/admin/search-input";

import { DataImportButton } from "../dataImport/DataImportButton";
import { TopToolbar } from "../layout/TopToolbar";
import { AccountManagerInput } from "../sales/AccountManagerInput";
import { RelationshipStatusField } from "../misc/RelationshipStatusField";
import { DealArchivedList } from "./DealArchivedList";
import { DealCreate } from "./DealCreate";
import { DealEdit } from "./DealEdit";
import { DealEmpty } from "./DealEmpty";
import { DealShow } from "./DealShow";
import { DealTitle } from "./DealTitle";
import { OnlyMineInput } from "./OnlyMineInput";

const DealList = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const { canAccess: canAccessSalesList, isPending } = useCanAccess({
    resource: "sales",
    action: "list",
  });

  if (!identity) return null;

  const dealFilters = [
    <SearchInput source="q" alwaysOn />,
    <ReferenceInput source="company_id" reference="companies">
      <AutocompleteInput
        label={false}
        placeholder={translate("resources.deals.fields.company_id")}
      />
    </ReferenceInput>,
    ...(isPending
      ? []
      : [
          canAccessSalesList ? (
            <AccountManagerInput source="sales_id" alwaysOn />
          ) : (
            <OnlyMineInput source="sales_id" alwaysOn />
          ),
        ]),
  ];

  return (
    <List
      perPage={25}
      filter={{ "archived_at@is": null }}
      title={false}
      sort={{ field: "created_at", order: "DESC" }}
      filters={dealFilters}
      actions={<DealActions />}
    >
      <DealLayout />
    </List>
  );
};

const DealLayout = () => {
  const location = useLocation();
  const matchCreate = matchPath("/deals/create", location.pathname);
  const matchShow = matchPath("/deals/:id/show", location.pathname);
  const matchEdit = matchPath("/deals/:id", location.pathname);

  const { data, isPending, filterValues } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters)
    return (
      <DealEmpty>
        <DealShow open={!!matchShow} id={matchShow?.params.id} />
        <DealArchivedList />
      </DealEmpty>
    );

  return (
    <div className="w-full">
      <DealTable />
      <DealArchivedList />
      <DealCreate open={!!matchCreate} />
      <DealEdit open={!!matchEdit && !matchCreate} id={matchEdit?.params.id} />
      <DealShow open={!!matchShow} id={matchShow?.params.id} />
    </div>
  );
};

const DealTable = () => (
  <DataTable rowClick="show">
    <DataTable.Col label="resources.deals.fields.title">
      <DealTitle />
    </DataTable.Col>
    <DataTable.Col source="company_id">
      <ReferenceField source="company_id" reference="companies" link={false} />
    </DataTable.Col>
    <DataTable.Col source="confidentiality">
      <RelationshipStatusField source="confidentiality" />
    </DataTable.Col>
    <DataTable.Col source="origin" />
    <DataTable.Col source="expected_closing_date">
      <DateField source="expected_closing_date" />
    </DataTable.Col>
    <DataTable.Col source="sales_id">
      <ReferenceField source="sales_id" reference="sales" link={false} />
    </DataTable.Col>
  </DataTable>
);

const DealActions = () => (
  <TopToolbar>
    <FilterButton />
    <DataImportButton resource="deals" />
    <ExportButton />
    <CreateButton label="resources.deals.action.new" />
  </TopToolbar>
);

export default DealList;
