import { Star } from "lucide-react";
import { useTranslate } from "ra-core";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { cn } from "@/lib/utils";

import { OPPORTUNITY_RATING_CHOICES } from "./concretizeChoices";

type RatingChoice = (typeof OPPORTUNITY_RATING_CHOICES)[number];

const formatRating = (value?: number | null) =>
  value == null ? "" : String(value);

const parseRating = (value: string) => (value === "" ? null : Number(value));

/**
 * Section 8 of the "Concretize" page: the five-star opportunity scale, each row
 * showing its stars next to the wording used on the paper form.
 */
export const AssessmentOpportunityRating = () => {
  const translate = useTranslate();

  return (
    <RadioButtonGroupInput
      source="opportunity_rating"
      label={false}
      choices={OPPORTUNITY_RATING_CHOICES}
      format={formatRating}
      parse={parseRating}
      optionText={(choice: RatingChoice) => (
        <span className="flex flex-row items-center gap-3">
          <span className="flex flex-row" aria-hidden>
            {[1, 2, 3, 4, 5].map((position) => (
              <Star
                key={position}
                className={cn(
                  "size-4",
                  position <= choice.stars
                    ? "fill-profile-2 text-profile-2"
                    : "text-muted-foreground",
                )}
              />
            ))}
          </span>
          {translate(choice.name)}
        </span>
      )}
    />
  );
};
