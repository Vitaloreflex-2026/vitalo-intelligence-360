import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { DateField } from "@/components/admin/date-field";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";

import { TopToolbar } from "../layout/TopToolbar";

const AssessmentListActions = () => (
  <TopToolbar>
    <ExportButton />
    <CreateButton label="resources.assessments.action.new" />
  </TopToolbar>
);

export const AssessmentList = () => (
  <List
    actions={<AssessmentListActions />}
    sort={{ field: "created_at", order: "DESC" }}
  >
    <DataTable>
      <DataTable.Col source="company_id">
        <ReferenceField source="company_id" reference="companies" />
      </DataTable.Col>
      <DataTable.Col source="created_at" field={DateField} />
    </DataTable>
  </List>
);
