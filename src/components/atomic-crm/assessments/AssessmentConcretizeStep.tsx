import {
  BarChart3,
  Calendar,
  CircleCheck,
  ClipboardList,
  Euro,
  FolderClosed,
  Lock,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { useTranslate } from "ra-core";
import { ArrayInput } from "@/components/admin/array-input";
import { CheckboxGroupInput } from "@/components/admin/checkbox-group-input";
import { DateInput } from "@/components/admin/date-input";
import { NumberInput } from "@/components/admin/number-input";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { TextInput } from "@/components/admin/text-input";

import { AssessmentDeciders } from "./AssessmentDeciders";
import { AssessmentOpportunityRating } from "./AssessmentOpportunityRating";
import { AssessmentOtherInput } from "./AssessmentOtherInput";
import { AssessmentSection } from "./AssessmentSection";
import {
  BUDGET_STATUS_CHOICES,
  CLOSING_CHECKLIST_CHOICES,
  DECISION_PROCESS_CHOICES,
  DEVELOPMENT_OPPORTUNITY_CHOICES,
  DOCUMENT_CHOICES,
  FOLLOW_UP_MODE_CHOICES,
  FOLLOW_UP_STATUS_CHOICES,
} from "./concretizeChoices";

/**
 * Page 4 of the VitalO IMPACT 360 discovery form: turning the recommendation
 * into an action plan.
 */
export const AssessmentConcretizeStep = () => {
  const translate = useTranslate();

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-md bg-brand-muted px-4 py-2 text-sm font-medium text-brand-heading">
        {translate("resources.assessments.concretize.subtitle")}
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <AssessmentSection
          number={1}
          title="resources.assessments.concretize.sections.interview_summary"
          icon={ClipboardList}
          hint="resources.assessments.concretize.hints.interview_summary"
        >
          <TextInput source="interview_summary" label={false} multiline />
        </AssessmentSection>

        <AssessmentSection
          number={2}
          title="resources.assessments.concretize.sections.deciders"
          icon={Users}
        >
          <AssessmentDeciders />
        </AssessmentSection>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr_2fr]">
        <AssessmentSection
          number={3}
          title="resources.assessments.concretize.sections.decision_process"
          icon={Users}
        >
          <CheckboxGroupInput
            source="decision_process"
            label={false}
            choices={DECISION_PROCESS_CHOICES}
          />
          <AssessmentOtherInput
            source="decision_process_other"
            group="decision_process"
          />
          <DateInput source="expected_decision_date" />
        </AssessmentSection>

        <AssessmentSection
          number={4}
          title="resources.assessments.concretize.sections.budget"
          icon={Euro}
        >
          <RadioButtonGroupInput
            source="budget_status"
            label={false}
            choices={BUDGET_STATUS_CHOICES}
          />
          <NumberInput source="estimated_budget" />
        </AssessmentSection>

        <AssessmentSection
          number={5}
          title="resources.assessments.concretize.sections.next_steps"
          icon={Calendar}
          hint="resources.assessments.concretize.hints.next_steps"
        >
          <ArrayInput source="next_steps" label={false}>
            <SimpleFormIterator inline>
              <TextInput source="action" />
              <TextInput source="owner" />
              {/* The inline row would otherwise squeeze the date below the
                  width a full date needs. */}
              <DateInput source="due_date" inputClassName="min-w-36" />
            </SimpleFormIterator>
          </ArrayInput>
        </AssessmentSection>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr_2fr]">
        <AssessmentSection
          number={6}
          title="resources.assessments.concretize.sections.documents_to_send"
          icon={FolderClosed}
        >
          <CheckboxGroupInput
            source="documents_to_send"
            label={false}
            choices={DOCUMENT_CHOICES}
            columns={2}
          />
          <AssessmentOtherInput
            source="documents_to_send_other"
            group="documents_to_send"
          />
        </AssessmentSection>

        <AssessmentSection
          number={7}
          title="resources.assessments.concretize.sections.next_follow_up"
          icon={Phone}
        >
          <DateInput source="next_follow_up_date" />
          <RadioButtonGroupInput
            source="next_follow_up_mode"
            label="resources.assessments.fields.next_follow_up_mode"
            choices={FOLLOW_UP_MODE_CHOICES}
            optionText={(choice: (typeof FOLLOW_UP_MODE_CHOICES)[number]) => (
              <span className="flex flex-row items-center gap-2">
                <choice.icon className="size-4 text-brand" />
                {translate(choice.name)}
              </span>
            )}
          />
        </AssessmentSection>

        <AssessmentSection
          number={8}
          title="resources.assessments.concretize.sections.opportunity_rating"
          icon={Star}
        >
          <AssessmentOpportunityRating />
          <TextInput source="opportunity_rating_comments" multiline />
        </AssessmentSection>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <AssessmentSection
          title="resources.assessments.concretize.sections.development_potential"
          icon={BarChart3}
          hint="resources.assessments.concretize.hints.development_potential"
        >
          <CheckboxGroupInput
            source="development_opportunities"
            label={false}
            choices={DEVELOPMENT_OPPORTUNITY_CHOICES}
            columns={2}
          />
          <AssessmentOtherInput
            source="development_opportunities_other"
            group="development_opportunities"
          />
          <TextInput source="development_comments" multiline />
        </AssessmentSection>

        <AssessmentSection
          number={9}
          title="resources.assessments.concretize.sections.follow_up_status"
          icon={ClipboardList}
        >
          <CheckboxGroupInput
            source="follow_up_status"
            label={false}
            choices={FOLLOW_UP_STATUS_CHOICES}
            columns={2}
          />
          <TextInput source="follow_up_comments" multiline />
        </AssessmentSection>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <AssessmentSection
          title="resources.assessments.concretize.sections.closing_checklist"
          icon={CircleCheck}
        >
          <CheckboxGroupInput
            source="closing_checklist"
            label={false}
            choices={CLOSING_CHECKLIST_CHOICES}
          />
        </AssessmentSection>

        <AssessmentSection
          title="resources.assessments.concretize.sections.closing"
          icon={Lock}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput source="closed_by" />
            <DateInput source="closed_at" />
          </div>
          <TextInput source="next_action" />
        </AssessmentSection>
      </div>
    </div>
  );
};
