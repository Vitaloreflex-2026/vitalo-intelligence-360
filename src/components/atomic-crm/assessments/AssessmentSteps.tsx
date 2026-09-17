import { required } from "ra-core";
import { ReferenceInput } from "@/components/admin/reference-input";
import { WizardFormStep } from "@/components/admin/wizard-form";

import { AutocompleteCompanyInput } from "../companies/AutocompleteCompanyInput";
import { AssessmentDiagnosticStep } from "./AssessmentDiagnosticStep";
import { AssessmentConcretizeStep } from "./AssessmentConcretizeStep";
import { AssessmentRecommendStep } from "./AssessmentRecommendStep";

/**
 * The steps of the assessment wizard, shared by the create and the edit view.
 * Add a <WizardFormStep> here for each new page of the discovery form.
 */
export const assessmentSteps = (
  <>
    <WizardFormStep label="resources.assessments.steps.company">
      <ReferenceInput source="company_id" reference="companies">
        <AutocompleteCompanyInput
          label="resources.assessments.fields.company_id"
          validate={required()}
          modal
        />
      </ReferenceInput>
    </WizardFormStep>
    <WizardFormStep label="resources.assessments.steps.diagnostic">
      <AssessmentDiagnosticStep />
    </WizardFormStep>
    <WizardFormStep label="resources.assessments.steps.recommend">
      <AssessmentRecommendStep />
    </WizardFormStep>
    <WizardFormStep label="resources.assessments.steps.concretize">
      <AssessmentConcretizeStep />
    </WizardFormStep>
  </>
);
