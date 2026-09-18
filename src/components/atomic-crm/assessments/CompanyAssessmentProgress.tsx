import { CircleCheck } from "lucide-react";
import { useRecordContext, useTranslate } from "ra-core";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type { Company } from "../types";
import {
  ASSESSMENT_STEP_COUNT,
  getCompletedAssessmentSteps,
} from "./assessmentProgress";
import { useCompanyLatestAssessment } from "./useCompanyLatestAssessment";

/**
 * One filling level per number of completed steps, from "nothing answered" to
 * "every step answered", each with the colour that codes it.
 */
const STEP_LEVELS = [
  { percent: 0, bar: "bg-muted-foreground/40", text: "text-muted-foreground" },
  { percent: 33, bar: "bg-profile-3", text: "text-profile-3" },
  { percent: 66, bar: "bg-profile-2", text: "text-profile-2" },
  { percent: 100, bar: "bg-brand", text: "text-brand" },
];

/**
 * How far the assessment of a company has been filled in, as a colour-coded
 * progress bar over the three answer steps of the discovery form.
 */
export const CompanyAssessmentProgress = () => {
  const company = useRecordContext<Company>();
  const translate = useTranslate();
  const { assessment, isPending } = useCompanyLatestAssessment(company);

  if (!company || isPending) return null;

  const completedSteps = getCompletedAssessmentSteps(assessment);
  const isComplete = completedSteps === ASSESSMENT_STEP_COUNT;
  const level = STEP_LEVELS[completedSteps];
  const label = translate("resources.assessments.progress.label");

  const status = isComplete
    ? translate("resources.assessments.progress.complete")
    : completedSteps === 0
      ? translate("resources.assessments.progress.not_started")
      : translate("resources.assessments.progress.steps", {
          smart_count: completedSteps,
          total: ASSESSMENT_STEP_COUNT,
        });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex flex-row items-center gap-1 font-medium",
            level.text,
          )}
        >
          {isComplete && <CircleCheck className="size-4" />}
          {status}
        </span>
      </div>
      <Progress
        value={level.percent}
        indicatorClassName={level.bar}
        aria-label={label}
      />
    </div>
  );
};
