import { CreateBase } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { WizardForm } from "@/components/admin/wizard-form";

import { assessmentSteps } from "./AssessmentSteps";

export const AssessmentCreate = () => (
  <CreateBase redirect="list">
    <div className="mt-2">
      <Card>
        <CardContent>
          <WizardForm className="max-w-none [&_label]:text-foreground">
            {assessmentSteps}
          </WizardForm>
        </CardContent>
      </Card>
    </div>
  </CreateBase>
);
