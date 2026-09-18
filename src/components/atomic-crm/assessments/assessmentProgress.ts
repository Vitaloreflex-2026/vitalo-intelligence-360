import type { Assessment } from "../types";

/**
 * The answer fields of each wizard step, in wizard order. The company selection
 * step is left out on purpose: picking the company is a prerequisite, not part
 * of the three steps the progress is measured against.
 *
 * The record holds no per-step marker, so progress is derived from the answers:
 * a step counts as started as soon as one of its fields holds a value. The
 * `*_other` free-text fields are skipped, since they are only editable once
 * their parent checkbox group has the matching option ticked — they can never
 * be the only answer of a step.
 */
const STEP_FIELDS: (keyof Assessment)[][] = [
  // Diagnose
  [
    "governance_maturity",
    "governance_owners",
    "governance_forums",
    "existing_programs",
    "existing_programs_comments",
    "manager_training",
    "manager_confidence",
    "priority_issues",
    "priority_issues_comments",
    "company_strengths",
    "company_strengths_comments",
    "identified_barriers",
    "identified_barriers_comments",
    "urgency_level",
    "urgency_comments",
    "client_priority_1",
    "client_priority_2",
    "client_priority_3",
    "impact_awareness",
    "impact_management",
    "impact_prevention",
    "impact_steering",
    "impact_culture",
    "impact_measurement",
    "overall_profile_level",
    "overall_profile_comments",
  ],
  // Recommend
  [
    "diagnostic_summary",
    "support_objectives",
    "journey_steps",
    "recommended_path",
    "consultant_recommendations",
    "target_audiences",
    "deployment_short_term",
    "deployment_medium_term",
    "deployment_long_term",
    "expected_benefits",
    "success_factors",
    "watch_points",
  ],
  // Concretize
  [
    "interview_summary",
    "decider_management_contact_id",
    "decider_management_influence",
    "decider_hr_contact_id",
    "decider_hr_influence",
    "decider_manager_contact_id",
    "decider_manager_influence",
    "decider_cse_contact_id",
    "decider_cse_influence",
    "decider_other_contact_id",
    "decider_other_influence",
    "decision_process",
    "expected_decision_date",
    "budget_status",
    "estimated_budget",
    "next_steps",
    "documents_to_send",
    "next_follow_up_date",
    "next_follow_up_mode",
    "opportunity_rating",
    "opportunity_rating_comments",
    "follow_up_status",
    "follow_up_comments",
    "development_opportunities",
    "development_comments",
    "closing_checklist",
    "closed_by_id",
    "closed_at",
    "next_action",
  ],
];

/** How many steps the progress of an assessment is measured against. */
export const ASSESSMENT_STEP_COUNT = STEP_FIELDS.length;

const hasAnswer = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== "";
};

/**
 * How many of the three answer steps hold at least one answer, from 0 (empty or
 * missing assessment) to {@link ASSESSMENT_STEP_COUNT}.
 */
export const getCompletedAssessmentSteps = (
  assessment?: Assessment | null,
): number =>
  assessment
    ? STEP_FIELDS.filter((fields) =>
        fields.some((field) => hasAnswer(assessment[field])),
      ).length
    : 0;
