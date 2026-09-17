import {
  ClipboardList,
  Clock,
  Crosshair,
  Lightbulb,
  Puzzle,
  Star,
  TriangleAlert,
  Trophy,
  Users,
} from "lucide-react";
import { useTranslate } from "ra-core";
import { CheckboxGroupInput } from "@/components/admin/checkbox-group-input";
import { TextInput } from "@/components/admin/text-input";

import { AssessmentSection } from "./AssessmentSection";
import {
  AssessmentJourneyInput,
  AssessmentRecommendedPath,
} from "./AssessmentJourney";
import { AssessmentOtherInput } from "./AssessmentOtherInput";
import {
  CONSULTANT_RECOMMENDATION_CHOICES,
  DEPLOYMENT_LONG_TERM_CHOICES,
  DEPLOYMENT_MEDIUM_TERM_CHOICES,
  DEPLOYMENT_SHORT_TERM_CHOICES,
  SUCCESS_FACTOR_CHOICES,
  SUPPORT_OBJECTIVE_CHOICES,
  TARGET_AUDIENCE_CHOICES,
  TARGET_POPULATION_CHOICE_ID,
} from "./recommendChoices";

/**
 * Page 3 of the VitalO IMPACT 360 discovery form: building a tailored
 * prevention journey out of the diagnosis.
 */
export const AssessmentRecommendStep = () => {
  const translate = useTranslate();

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-md bg-brand-muted px-4 py-2 text-sm font-medium text-brand-heading">
        {translate("resources.assessments.recommend.subtitle")}
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <AssessmentSection
          number={1}
          title="resources.assessments.recommend.sections.diagnostic_summary"
          icon={ClipboardList}
          hint="resources.assessments.recommend.hints.diagnostic_summary"
        >
          <TextInput source="diagnostic_summary" label={false} multiline />
        </AssessmentSection>

        <AssessmentSection
          number={2}
          title="resources.assessments.recommend.sections.support_objectives"
          icon={Crosshair}
        >
          <CheckboxGroupInput
            source="support_objectives"
            label={false}
            choices={SUPPORT_OBJECTIVE_CHOICES}
            columns={2}
          />
          <AssessmentOtherInput
            source="support_objectives_other"
            group="support_objectives"
          />
        </AssessmentSection>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <AssessmentSection
          number={3}
          title="resources.assessments.recommend.sections.journey"
          icon={Users}
          hint="resources.assessments.recommend.hints.journey"
        >
          <AssessmentJourneyInput />
        </AssessmentSection>

        <AssessmentSection
          title="resources.assessments.recommend.sections.recommended_path"
          icon={Puzzle}
          hint="resources.assessments.recommend.hints.recommended_path"
        >
          <AssessmentRecommendedPath />
        </AssessmentSection>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <AssessmentSection
          number={4}
          title="resources.assessments.recommend.sections.consultant_recommendations"
          icon={Lightbulb}
        >
          <CheckboxGroupInput
            source="consultant_recommendations"
            label={false}
            choices={CONSULTANT_RECOMMENDATION_CHOICES}
            columns={2}
          />
          <AssessmentOtherInput
            source="consultant_recommendations_other"
            group="consultant_recommendations"
          />
        </AssessmentSection>

        <AssessmentSection
          number={5}
          title="resources.assessments.recommend.sections.target_audiences"
          icon={Users}
        >
          <CheckboxGroupInput
            source="target_audiences"
            label={false}
            choices={TARGET_AUDIENCE_CHOICES}
            columns={2}
          />
          <AssessmentOtherInput
            source="target_audience_other"
            group="target_audiences"
            option={TARGET_POPULATION_CHOICE_ID}
          />
        </AssessmentSection>
      </div>

      <AssessmentSection
        number={6}
        title="resources.assessments.recommend.sections.deployment_priority"
        icon={Clock}
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <CheckboxGroupInput
            source="deployment_short_term"
            label="resources.assessments.fields.deployment_short_term"
            choices={DEPLOYMENT_SHORT_TERM_CHOICES}
          />
          <CheckboxGroupInput
            source="deployment_medium_term"
            label="resources.assessments.fields.deployment_medium_term"
            choices={DEPLOYMENT_MEDIUM_TERM_CHOICES}
          />
          <CheckboxGroupInput
            source="deployment_long_term"
            label="resources.assessments.fields.deployment_long_term"
            choices={DEPLOYMENT_LONG_TERM_CHOICES}
          />
        </div>
      </AssessmentSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <AssessmentSection
          number={7}
          title="resources.assessments.recommend.sections.expected_benefits"
          icon={Star}
          hint="resources.assessments.recommend.hints.expected_benefits"
        >
          <TextInput source="expected_benefits" label={false} multiline />
        </AssessmentSection>

        <AssessmentSection
          number={8}
          title="resources.assessments.recommend.sections.success_factors"
          icon={Trophy}
        >
          <CheckboxGroupInput
            source="success_factors"
            label={false}
            choices={SUCCESS_FACTOR_CHOICES}
            columns={2}
          />
          <AssessmentOtherInput
            source="success_factors_other"
            group="success_factors"
          />
        </AssessmentSection>
      </div>

      <AssessmentSection
        number={9}
        title="resources.assessments.recommend.sections.watch_points"
        icon={TriangleAlert}
        hint="resources.assessments.recommend.hints.watch_points"
      >
        <TextInput source="watch_points" label={false} multiline />
      </AssessmentSection>
    </div>
  );
};
