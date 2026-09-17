import type { ComponentType, SVGProps } from "react";
import {
  ChartColumn,
  Crosshair,
  Heart,
  Megaphone,
  ShieldCheck,
  SquareCheckBig,
  Users,
  UsersRound,
} from "lucide-react";
import { useTranslate } from "ra-core";
import { RadioButtonGroupInput } from "@/components/admin/radio-button-group-input";
import { TextInput } from "@/components/admin/text-input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  formatProfileLevel,
  IMPACT_DIMENSIONS,
  parseProfileLevel,
  PROFILE_LEVEL_CHOICES,
} from "./diagnosticChoices";

/** One pictogram per dimension, mirroring the printed profile table. */
const DIMENSION_ICONS: Record<
  (typeof IMPACT_DIMENSIONS)[number],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  impact_awareness: Megaphone,
  impact_management: Users,
  impact_prevention: ShieldCheck,
  impact_steering: Crosshair,
  impact_culture: Heart,
  impact_measurement: ChartColumn,
};

/** Each level keeps the colour and the pictogram it has on the paper form. */
const OVERALL_LEVELS = [
  { level: 1, icon: SquareCheckBig, color: "text-profile-1" },
  { level: 2, icon: Users, color: "text-profile-2" },
  { level: 3, icon: Crosshair, color: "text-profile-3" },
  { level: 4, icon: UsersRound, color: "text-profile-4" },
].map(({ level, icon, color }) => ({
  id: String(level),
  icon,
  color,
  name: `resources.assessments.diagnostic.overall_profile_level.level_${level}`,
  description: `resources.assessments.diagnostic.overall_profile_level.level_${level}_help`,
}));

type OverallLevel = (typeof OVERALL_LEVELS)[number];

/**
 * Section 9 of the "Diagnose" page: one level per dimension, then the overall
 * profile level the consultant retains.
 */
export const AssessmentImpactProfile = () => {
  const translate = useTranslate();

  return (
    <Card className="h-fit border-brand/40">
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="flex flex-row items-center gap-2 text-base font-semibold text-brand-heading">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <ChartColumn className="size-4" />
            </span>
            <span className="text-brand">9.</span>
            {translate(
              "resources.assessments.diagnostic.sections.impact_profile",
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            {translate("resources.assessments.diagnostic.impact_profile.help")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {IMPACT_DIMENSIONS.map((dimension) => {
            const Icon = DIMENSION_ICONS[dimension];
            return (
              <div key={dimension} className="flex flex-row items-start gap-2">
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
                  <Icon className="size-4" />
                </span>
                <RadioButtonGroupInput
                  source={dimension}
                  label={`resources.assessments.fields.${dimension}`}
                  choices={PROFILE_LEVEL_CHOICES}
                  translateChoice={false}
                  format={formatProfileLevel}
                  parse={parseProfileLevel}
                  row
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-brand-heading">
            {translate(
              "resources.assessments.diagnostic.impact_profile.overall_title",
            )}
          </h4>
          <RadioButtonGroupInput
            source="overall_profile_level"
            label={false}
            choices={OVERALL_LEVELS}
            format={formatProfileLevel}
            parse={parseProfileLevel}
            optionText={(choice: OverallLevel) => (
              <span className="flex flex-row items-start gap-2">
                <span className={cn("mt-0.5 shrink-0", choice.color)}>
                  <choice.icon className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className={cn("font-medium", choice.color)}>
                    {choice.id}. {translate(choice.name)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {translate(choice.description)}
                  </span>
                </span>
              </span>
            )}
          />
        </div>

        <TextInput source="overall_profile_comments" multiline />
      </CardContent>
    </Card>
  );
};
