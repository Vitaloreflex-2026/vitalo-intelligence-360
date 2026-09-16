import { ArrowDown, ArrowRight } from "lucide-react";
import { useInput, useTranslate } from "ra-core";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { JOURNEY_STEPS, RECOMMENDED_PATH_STEPS } from "./recommendChoices";

// Tailwind needs the full class names, so the colour tokens are spelled out.
const STEP_COLORS = [
  { text: "text-journey-1", bg: "bg-journey-1", border: "border-journey-1" },
  { text: "text-journey-2", bg: "bg-journey-2", border: "border-journey-2" },
  { text: "text-journey-3", bg: "bg-journey-3", border: "border-journey-3" },
  { text: "text-journey-4", bg: "bg-journey-4", border: "border-journey-4" },
  { text: "text-journey-5", bg: "bg-journey-5", border: "border-journey-5" },
  { text: "text-journey-6", bg: "bg-journey-6", border: "border-journey-6" },
];

const useCheckedSet = (source: string) => {
  const { id, field } = useInput({ source });
  const values: string[] = Array.isArray(field.value) ? field.value : [];
  const toggle = (value: string, isChecked: boolean) =>
    field.onChange(
      isChecked ? [...values, value] : values.filter((item) => item !== value),
    );
  return { id, values, toggle };
};

/**
 * Section 3 of the "Recommend" page: the six steps of the IMPACT 360 journey,
 * each keeping the number, pictogram and colour it has on the paper form.
 */
export const AssessmentJourneyInput = () => {
  const translate = useTranslate();
  const { id, values, toggle } = useCheckedSet("journey_steps");

  return (
    <div className="flex flex-row items-stretch gap-1">
      {JOURNEY_STEPS.map((step, index) => {
        const color = STEP_COLORS[step.color - 1];
        const inputId = `${id}-${step.id}`;
        return (
          <div
            key={step.id}
            className="flex min-w-0 flex-1 flex-row items-center gap-1"
          >
            <Label
              htmlFor={inputId}
              className={cn(
                // The whole card is the checkbox label, so a click anywhere on
                // it ticks the box. The six steps share the row, as they do on
                // one printed line.
                "flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 rounded-lg border p-2",
                values.includes(step.id) ? color.border : "border-border",
              )}
            >
              <span
                // Decorative: the rank is already carried by the reading order,
                // and it would otherwise pollute the checkbox accessible name.
                aria-hidden
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-sm font-semibold text-white",
                  color.bg,
                )}
              >
                {index + 1}
              </span>
              <step.icon className={cn("size-6", color.text)} />
              <span
                className={cn(
                  "text-center text-xs font-semibold uppercase",
                  color.text,
                )}
              >
                {translate(
                  `resources.assessments.recommend.journey_steps.${step.id}`,
                )}
              </span>
              <Checkbox
                id={inputId}
                checked={values.includes(step.id)}
                onCheckedChange={(isChecked) =>
                  toggle(step.id, isChecked === true)
                }
              />
            </Label>
            {index < JOURNEY_STEPS.length - 1 && (
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * The "Recommended path" panel next to the journey: the same steps chained
 * vertically, as the indicative example printed on the form.
 */
export const AssessmentRecommendedPath = () => {
  const translate = useTranslate();
  const { id, values, toggle } = useCheckedSet("recommended_path");

  return (
    <div className="flex flex-col gap-1">
      {RECOMMENDED_PATH_STEPS.map((step, index) => {
        const color = STEP_COLORS[step.color - 1];
        const inputId = `${id}-${step.id}`;
        return (
          <div key={step.id} className="flex flex-col items-center gap-1">
            <Label
              htmlFor={inputId}
              className={cn(
                "flex w-full cursor-pointer flex-row items-center gap-3 rounded-lg border p-2",
                values.includes(step.id) ? color.border : "border-border",
              )}
            >
              <Checkbox
                id={inputId}
                checked={values.includes(step.id)}
                onCheckedChange={(isChecked) =>
                  toggle(step.id, isChecked === true)
                }
              />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-white",
                  color.bg,
                )}
              >
                <step.icon className="size-4" />
              </span>
              <span className={cn("text-sm font-semibold", color.text)}>
                {translate(
                  `resources.assessments.recommend.recommended_path.${step.id}`,
                )}
              </span>
            </Label>
            {index < RECOMMENDED_PATH_STEPS.length - 1 && (
              <ArrowDown
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
