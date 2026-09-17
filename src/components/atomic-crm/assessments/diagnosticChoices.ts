/**
 * Option lists of the "Diagnose" page of the VitalO IMPACT 360 discovery form.
 *
 * Each choice id is the value stored in database; its name is an i18n key, so the
 * labels live in the translation catalogs like every other user-facing string.
 */
/** The id of the "Other" option, which unlocks the free-text field next to a group. */
export const OTHER_CHOICE_ID = "other";

const buildChoices = (group: string, ids: string[]) =>
  ids.map((id) => ({
    id,
    name: `resources.assessments.diagnostic.${group}.${id}`,
  }));

export const GOVERNANCE_MATURITY_CHOICES = buildChoices("governance_maturity", [
  "no_approach",
  "occasional_actions",
  "being_structured",
  "integrated_in_qvct",
  "strategic_focus",
]);

export const GOVERNANCE_OWNER_CHOICES = buildChoices("governance_owners", [
  "executive_management",
  "hr_department",
  "managers",
  "cse",
  "cssct",
  "qvct_lead",
  "hse_department",
  "other",
]);

export const GOVERNANCE_FORUM_CHOICES = buildChoices("governance_forums", [
  "codir_comex",
  "cse",
  "cssct",
  "manager_meetings",
  "duerp",
  "never",
  "other",
]);

export const EXISTING_PROGRAM_CHOICES = buildChoices("existing_programs", [
  "social_barometer",
  "qvct_survey",
  "listening_unit",
  "psychological_support",
  "occupational_health",
  "workshops",
  "safety_days",
  "awareness_sessions",
  "pssm",
  "manager_training",
  "none",
]);

export const MANAGER_TRAINING_CHOICES = buildChoices("manager_training", [
  "weak_signals",
  "struggling_employee",
  "workplace_mental_health",
  "psychosocial_risks",
  "none",
]);

export const MANAGER_CONFIDENCE_CHOICES = buildChoices("manager_confidence", [
  "very_comfortable",
  "fairly_comfortable",
  "not_very_comfortable",
  "struggling",
]);

export const PRIORITY_ISSUE_CHOICES = buildChoices("priority_issues", [
  "chronic_stress",
  "mental_load",
  "fatigue",
  "burnout",
  "disengagement",
  "relational_tensions",
  "harassment",
  "violence",
  "addictions",
  "absenteeism",
  "recruitment_difficulties",
  "turnover",
  "reorganization",
  "other",
]);

export const COMPANY_STRENGTH_CHOICES = buildChoices("company_strengths", [
  "engaged_management",
  "mobilized_managers",
  "dialogue_culture",
  "existing_qvct_approach",
  "internal_communication",
  "willingness_to_improve",
  "internal_network",
  "other",
]);

export const IDENTIFIED_BARRIER_CHOICES = buildChoices("identified_barriers", [
  "budget",
  "time",
  "team_availability",
  "competing_priorities",
  "change_resistance",
  "lack_of_buy_in",
  "organizational_difficulties",
  "other",
]);

export const URGENCY_LEVEL_CHOICES = buildChoices("urgency_level", [
  "immediate",
  "three_to_six_months",
  "six_to_twelve_months",
  "more_than_a_year",
]);

/** The six dimensions rated from 1 to 4 in the IMPACT 360 profile. */
export const IMPACT_DIMENSIONS = [
  "impact_awareness",
  "impact_management",
  "impact_prevention",
  "impact_steering",
  "impact_culture",
  "impact_measurement",
] as const;

export const PROFILE_LEVEL_CHOICES = [1, 2, 3, 4].map((level) => ({
  id: String(level),
  name: String(level),
}));

/** Levels are stored as smallint but rendered by radio inputs, which need strings. */
export const formatProfileLevel = (value?: number | null) =>
  value == null ? "" : String(value);

export const parseProfileLevel = (value: string) =>
  value === "" ? null : Number(value);
