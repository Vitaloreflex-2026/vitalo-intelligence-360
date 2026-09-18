import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";
import { SortButton } from "@/components/admin/sort-button";
import { TextField } from "@/components/admin/text-field";

import { DataImportButton } from "../dataImport/DataImportButton";
import { TopToolbar } from "../layout/TopToolbar";
import { ASSESSMENT_STEPS } from "./assessmentProgress";
import { AssessmentStepStatus } from "./AssessmentStepStatus";

const AssessmentListActions = () => (
  <TopToolbar>
    {/* Below the mobile breakpoint the DataTable drops its sortable header,
        so the sort has to stay reachable from the toolbar. */}
    <SortButton fields={["company_id", "created_at"]} />
    <ExportButton />
    <DataImportButton resource="assessments" />
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
        {/* Linked to the company page, and underlined so the link shows. */}
        <ReferenceField source="company_id" reference="companies" link="show">
          <TextField source="name" className="underline hover:no-underline" />
        </ReferenceField>
      </DataTable.Col>
      {ASSESSMENT_STEPS.map((step) => (
        // Filling is derived from the answers, so the column cannot be sorted.
        <DataTable.Col
          key={step}
          label={`resources.assessments.steps.${step}`}
          disableSort
        >
          <AssessmentStepStatus step={step} />
        </DataTable.Col>
      ))}
    </DataTable>
  </List>
);
