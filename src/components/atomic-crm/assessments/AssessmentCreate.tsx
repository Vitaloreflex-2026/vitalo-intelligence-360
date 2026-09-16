import { CreateBase } from "ra-core";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { WizardForm } from "@/components/admin/wizard-form";

import { assessmentSteps } from "./AssessmentSteps";

export const AssessmentCreate = () => {
  // Coming from a company, the first step is already answered, so open on the
  // second one. The stepper still allows going back to change the company.
  const { state } = useLocation();
  const hasPresetCompany =
    (state as { record?: { company_id?: unknown } } | null)?.record
      ?.company_id != null;

  return (
    <CreateBase redirect="list">
      <div className="mt-2">
        <Card>
          <CardContent>
            <WizardForm
              className="max-w-none [&_label]:text-foreground"
              initialStep={hasPresetCompany ? 1 : 0}
            >
              {assessmentSteps}
            </WizardForm>
          </CardContent>
        </Card>
      </div>
    </CreateBase>
  );
};
