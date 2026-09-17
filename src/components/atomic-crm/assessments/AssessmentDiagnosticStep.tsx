import {
  ClipboardList,
  Clock,
  Crosshair,
  Lock,
  ShieldCheck,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { useTranslate } from "ra-core";
import { CheckboxGroupInput } from "@/components/admin/checkbox-group-input";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { TextInput } from "@/components/admin/text-input";

import { AssessmentImpactProfile } from "./AssessmentImpactProfile";
import { AssessmentSection } from "./AssessmentSection";
import { AssessmentOtherInput } from "./AssessmentOtherInput";
import {
  COMPANY_STRENGTH_CHOICES,
  EXISTING_PROGRAM_CHOICES,
  GOVERNANCE_FORUM_CHOICES,
  GOVERNANCE_MATURITY_CHOICES,
  GOVERNANCE_OWNER_CHOICES,
  IDENTIFIED_BARRIER_CHOICES,
  MANAGER_CONFIDENCE_CHOICES,
  MANAGER_TRAINING_CHOICES,
  PRIORITY_ISSUE_CHOICES,
  URGENCY_LEVEL_CHOICES,
} from "./diagnosticChoices";

/**
 * Page 2 of the VitalO IMPACT 360 discovery form: where the company stands today.
 * Sections 1 to 8 on the left, the IMPACT 360 profile (section 9) on the right.
 */
export const AssessmentDiagnosticStep = () => {
  const translate = useTranslate();

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-md bg-brand-muted px-4 py-2 text-sm font-medium text-brand-heading">
        {translate("resources.assessments.diagnostic.subtitle")}
      </p>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <AssessmentSection
            number={1}
            title="resources.assessments.diagnostic.sections.governance"
            icon={Users}
          >
            <RadioButtonGroupInput
              source="governance_maturity"
              label="resources.assessments.fields.governance_maturity"
              choices={GOVERNANCE_MATURITY_CHOICES}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <CheckboxGroupInput
                  source="governance_owners"
                  choices={GOVERNANCE_OWNER_CHOICES}
                />
                <AssessmentOtherInput
                  source="governance_owners_other"
                  group="governance_owners"
                />
              </div>
              <div className="flex flex-col gap-2">
                <CheckboxGroupInput
                  source="governance_forums"
                  choices={GOVERNANCE_FORUM_CHOICES}
                />
                <AssessmentOtherInput
                  source="governance_forums_other"
                  group="governance_forums"
                />
              </div>
            </div>
          </AssessmentSection>

          <AssessmentSection
            number={2}
            title="resources.assessments.diagnostic.sections.existing_programs"
            icon={ClipboardList}
          >
            <CheckboxGroupInput
              source="existing_programs"
              label={false}
              choices={EXISTING_PROGRAM_CHOICES}
              columns={3}
            />
            <TextInput source="existing_programs_comments" multiline />
          </AssessmentSection>

          <AssessmentSection
            number={3}
            title="resources.assessments.diagnostic.sections.managerial_maturity"
            icon={UserRound}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <CheckboxGroupInput
                source="manager_training"
                choices={MANAGER_TRAINING_CHOICES}
              />
              <RadioButtonGroupInput
                source="manager_confidence"
                label="resources.assessments.fields.manager_confidence"
                choices={MANAGER_CONFIDENCE_CHOICES}
              />
            </div>
          </AssessmentSection>

          <AssessmentSection
            number={4}
            title="resources.assessments.diagnostic.sections.priority_issues"
            icon={Crosshair}
          >
            <CheckboxGroupInput
              source="priority_issues"
              label={false}
              choices={PRIORITY_ISSUE_CHOICES}
              columns={3}
            />
            <AssessmentOtherInput
              source="priority_issues_other"
              group="priority_issues"
            />
            <TextInput source="priority_issues_comments" multiline />
          </AssessmentSection>

          <AssessmentSection
            number={5}
            title="resources.assessments.diagnostic.sections.company_strengths"
            icon={ShieldCheck}
          >
            <CheckboxGroupInput
              source="company_strengths"
              label={false}
              choices={COMPANY_STRENGTH_CHOICES}
              columns={3}
            />
            <AssessmentOtherInput
              source="company_strengths_other"
              group="company_strengths"
            />
            <TextInput source="company_strengths_comments" multiline />
          </AssessmentSection>

          <AssessmentSection
            number={6}
            title="resources.assessments.diagnostic.sections.identified_barriers"
            icon={Lock}
          >
            <CheckboxGroupInput
              source="identified_barriers"
              label={false}
              choices={IDENTIFIED_BARRIER_CHOICES}
              columns={3}
            />
            <AssessmentOtherInput
              source="identified_barriers_other"
              group="identified_barriers"
            />
            <TextInput source="identified_barriers_comments" multiline />
          </AssessmentSection>

          <AssessmentSection
            number={7}
            title="resources.assessments.diagnostic.sections.urgency"
            icon={Clock}
          >
            <RadioButtonGroupInput
              source="urgency_level"
              label={false}
              choices={URGENCY_LEVEL_CHOICES}
            />
            <TextInput source="urgency_comments" multiline />
          </AssessmentSection>

          <AssessmentSection
            number={8}
            title="resources.assessments.diagnostic.sections.client_priorities"
            icon={Star}
          >
            <TextInput source="client_priority_1" />
            <TextInput source="client_priority_2" />
            <TextInput source="client_priority_3" />
          </AssessmentSection>
        </div>

        <AssessmentImpactProfile />
      </div>
    </div>
  );
};
