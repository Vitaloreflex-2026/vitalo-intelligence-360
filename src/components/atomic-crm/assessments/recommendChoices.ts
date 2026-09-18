import type { ComponentType, SVGProps } from "react";
import {
  BarChart3,
  GraduationCap,
  HeartHandshake,
  Infinity as InfinityIcon,
  Rocket,
  Users,
} from "lucide-react";

/**
 * Option lists of the "Recommend" page of the VitalO IMPACT 360 discovery form.
 * Same convention as the "Diagnose" page: the id is stored, the name is an i18n key.
 */
const buildChoices = (group: string, ids: string[]) =>
  ids.map((id) => ({
    id,
    name: `resources.assessments.recommend.${group}.${id}`,
  }));

export const SUPPORT_OBJECTIVE_CHOICES = buildChoices("support_objectives", [
  "raise_awareness",
  "managerial_skills",
  "structure_prevention",
  "train_first_aiders",
  "strengthen_culture",
  "support_transformation",
  "reduce_psychosocial_risks",
  "improve_internal_dialogue",
  "other",
]);

export const CONSULTANT_RECOMMENDATION_CHOICES = buildChoices(
  "consultant_recommendations",
  [
    "psmt",
    "psmm",
    "pssm",
    "impact_360",
    "vitalo_app",
    "in_depth_diagnostic",
    "barometer",
    "thematic_workshops",
    "conference",
    "coaching",
    "strategic_support",
    "other",
  ],
);

export const TARGET_AUDIENCE_CHOICES = buildChoices("target_audiences", [
  "all_employees",
  "managers",
  "executive_management",
  "hr",
  "cse",
  "cssct",
  "qvct_leads",
  "target_population",
]);

/** The option that unlocks the free-text field of the audiences group. */
export const TARGET_POPULATION_CHOICE_ID = "target_population";

export const DEPLOYMENT_SHORT_TERM_CHOICES = buildChoices(
  "deployment_priority",
  ["immediate", "under_three_months"],
);

export const DEPLOYMENT_MEDIUM_TERM_CHOICES = buildChoices(
  "deployment_priority",
  ["three_to_six_months", "six_to_twelve_months"],
);

export const DEPLOYMENT_LONG_TERM_CHOICES = buildChoices(
  "deployment_priority",
  ["over_twelve_months"],
);

export const SUCCESS_FACTOR_CHOICES = buildChoices("success_factors", [
  "management_commitment",
  "internal_communication",
  "involved_managers",
  "employee_participation",
  "regular_steering",
  "results_measurement",
  "ambassador_network",
  "other",
]);

type JourneyEntry = {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Index of the --journey-N colour token carried by this entry on the paper form. */
  color: number;
};

/** The six steps of the VitalO IMPACT 360 journey, with their printed colours. */
export const JOURNEY_STEPS: JourneyEntry[] = [
  { id: "raise_awareness", icon: Users, color: 1 },
  { id: "train", icon: GraduationCap, color: 2 },
  { id: "deploy", icon: Rocket, color: 3 },
  { id: "support", icon: HeartHandshake, color: 4 },
  { id: "measure", icon: BarChart3, color: 5 },
  { id: "sustain", icon: InfinityIcon, color: 6 },
];

/** The suggested path shown alongside the journey, as an indicative example. */
export const RECOMMENDED_PATH_STEPS: JourneyEntry[] = [
  { id: "psmt_awareness", icon: Users, color: 1 },
  { id: "psmm_managers", icon: GraduationCap, color: 2 },
  { id: "pssm_training", icon: HeartHandshake, color: 3 },
  { id: "impact_360_deployment", icon: Rocket, color: 4 },
  { id: "annual_barometer", icon: BarChart3, color: 5 },
  { id: "managers_club", icon: Users, color: 6 },
];

/** The journey steps as a choice list, for the CSV importer. */
export const JOURNEY_STEP_CHOICES = JOURNEY_STEPS.map(({ id }) => ({
  id,
  name: `resources.assessments.recommend.journey_steps.${id}`,
}));

/** The recommended path steps as a choice list, for the CSV importer. */
export const RECOMMENDED_PATH_CHOICES = RECOMMENDED_PATH_STEPS.map(
  ({ id }) => ({
    id,
    name: `resources.assessments.recommend.recommended_path.${id}`,
  }),
);
