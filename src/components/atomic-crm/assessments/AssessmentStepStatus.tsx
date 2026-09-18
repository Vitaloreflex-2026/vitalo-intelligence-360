import { Check, X } from "lucide-react";
import { useRecordContext, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

import type { Assessment } from "../types";
import type { AssessmentStep } from "./assessmentProgress";
import { isAssessmentStepFilled } from "./assessmentProgress";

/**
 * Whether one step of an assessment has been filled in, as a pictogram with a
 * text alternative for screen readers.
 */
export const AssessmentStepStatus = ({ step }: { step: AssessmentStep }) => {
  const assessment = useRecordContext<Assessment>();
  const translate = useTranslate();
  const isFilled = isAssessmentStepFilled(assessment, step);
  const Icon = isFilled ? Check : X;

  return (
    <span
      className={cn(
        "flex flex-row items-center gap-1 text-sm",
        isFilled ? "text-brand" : "text-destructive",
      )}
    >
      <Icon className="size-4" />
      <span className="sr-only">
        {translate(
          `resources.assessments.progress.${isFilled ? "step_filled" : "step_empty"}`,
        )}
      </span>
    </span>
  );
};
