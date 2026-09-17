import { ClipboardList } from "lucide-react";
import { useGetList, useRecordContext, useTranslate } from "ra-core";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

import type { Assessment, Company } from "../types";

/**
 * Opens the assessment of a company from its show page: the latest one if it
 * already has any, a pre-filled creation form otherwise.
 */
export const CompanyAssessmentButton = () => {
  const company = useRecordContext<Company>();
  const translate = useTranslate();

  const { data, isPending } = useGetList<Assessment>(
    "assessments",
    {
      filter: { company_id: company?.id },
      pagination: { page: 1, perPage: 1 },
      sort: { field: "created_at", order: "DESC" },
    },
    { enabled: company?.id != null },
  );

  if (!company) return null;

  const existingAssessment = data?.[0];

  return (
    <Button
      variant="outline"
      asChild={!isPending}
      size="sm"
      className="h-9"
      // Until the lookup settles we cannot tell create from edit apart.
      disabled={isPending}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          {translate("resources.assessments.action.open")}
        </span>
      ) : (
        <RouterLink
          to={
            existingAssessment
              ? `/assessments/${existingAssessment.id}`
              : "/assessments/create"
          }
          state={
            existingAssessment
              ? undefined
              : { record: { company_id: company.id } }
          }
          className="flex items-center gap-2"
        >
          <ClipboardList className="h-4 w-4" />
          {translate("resources.assessments.action.open")}
        </RouterLink>
      )}
    </Button>
  );
};
