import { ShowBase, useRecordContext, useTranslate } from "ra-core";
import { EditButton } from "@/components/admin/edit-button";
import { RecordField } from "@/components/admin/record-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { SaleDocumentsDownloadCard } from "../documents/SaleDocumentsDownloadCard";
import type { Sale } from "../types";
import { salesName } from "./salesName";

const SaleSummaryCard = () => {
  const record = useRecordContext<Sale>();
  const translate = useTranslate();
  if (!record) return null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">{salesName(record)}</h2>
          <EditButton />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RecordField
            source="first_name"
            label="resources.sales.fields.first_name"
          />
          <RecordField
            source="last_name"
            label="resources.sales.fields.last_name"
          />
        </div>
        <RecordField source="email" label="resources.sales.fields.email" />
        <div className="flex flex-row gap-1">
          {record.administrator && (
            <Badge
              variant="outline"
              className="border-blue-300 dark:border-blue-700"
            >
              {translate("resources.sales.fields.administrator")}
            </Badge>
          )}
          {record.disabled && (
            <Badge
              variant="outline"
              className="border-orange-300 dark:border-orange-700"
            >
              {translate("resources.sales.fields.disabled")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SaleDocuments = () => {
  const record = useRecordContext<Sale>();
  if (!record) return null;
  return (
    <SaleDocumentsDownloadCard
      salesId={record.id}
      archiveName={salesName(record)}
    />
  );
};

/**
 * A team member's page: their identity, and the administrative papers they
 * filed — downloadable one by one or as a single archive.
 */
export function SalesShow() {
  return (
    <ShowBase>
      <div className="max-w-lg w-full mx-auto mt-8 space-y-4">
        <SaleSummaryCard />
        <SaleDocuments />
      </div>
    </ShowBase>
  );
}
