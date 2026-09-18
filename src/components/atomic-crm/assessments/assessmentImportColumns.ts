import type { ImportChoice } from "../dataImport/parseChoice";
import {
  COMPANY_STRENGTH_CHOICES,
  EXISTING_PROGRAM_CHOICES,
  GOVERNANCE_FORUM_CHOICES,
  GOVERNANCE_MATURITY_CHOICES,
  GOVERNANCE_OWNER_CHOICES,
  IDENTIFIED_BARRIER_CHOICES,
  MANAGER_CONFIDENCE_CHOICES,
  MANAGER_TRAINING_CHOICES,
  PRIORITY_ISSUE_CHOICES,
  URGENCY_LEVEL_CHOICES,
} from "./diagnosticChoices";
import {
  CONSULTANT_RECOMMENDATION_CHOICES,
  DEPLOYMENT_LONG_TERM_CHOICES,
  DEPLOYMENT_MEDIUM_TERM_CHOICES,
  DEPLOYMENT_SHORT_TERM_CHOICES,
  JOURNEY_STEP_CHOICES,
  RECOMMENDED_PATH_CHOICES,
  SUCCESS_FACTOR_CHOICES,
  SUPPORT_OBJECTIVE_CHOICES,
  TARGET_AUDIENCE_CHOICES,
} from "./recommendChoices";
import {
  BUDGET_STATUS_CHOICES,
  CLOSING_CHECKLIST_CHOICES,
  DECISION_PROCESS_CHOICES,
  DECIDER_ROLES,
  DEVELOPMENT_OPPORTUNITY_CHOICES,
  DOCUMENT_CHOICES,
  FOLLOW_UP_MODE_CHOICES,
  FOLLOW_UP_STATUS_CHOICES,
  INFLUENCE_LEVEL_CHOICES,
} from "./concretizeChoices";

/**
 * How one CSV column is read into its assessment field.
 *
 * - `text` — free text, stored as typed
 * - `level` — a rating stored in a smallint column, outside its range it is dropped
 * - `amount` — a decimal number
 * - `date` — a plain `YYYY-MM-DD` day
 * - `choice` / `choices` — one or several answers of a form option list; the CSV
 *   may spell either the stored id or the translated label
 */
export type ColumnSpec =
  | { kind: "text" }
  | { kind: "level"; min: number; max: number }
  | { kind: "amount" }
  | { kind: "date" }
  | { kind: "choice"; choices: ImportChoice[] }
  | { kind: "choices"; choices: ImportChoice[] };

const text = { kind: "text" } as const;
const date = { kind: "date" } as const;
/** The IMPACT 360 dimensions and the overall profile are rated from 1 to 4. */
const profileLevel = { kind: "level", min: 1, max: 4 } as const;
const choice = (choices: ImportChoice[]) =>
  ({ kind: "choice", choices }) as const;
const choices = (list: ImportChoice[]) =>
  ({ kind: "choices", choices: list }) as const;

/**
 * Every column of the assessment CSV that maps straight onto a database column,
 * in the order the sample file lists them. The columns naming a person (the
 * company, the deciders, who closed the file) and the `next_steps` table are
 * resolved separately by `useAssessmentImport`, because they need a lookup.
 */
export const ASSESSMENT_COLUMNS: Record<string, ColumnSpec> = {
  // Diagnose / governance and engagement
  governance_maturity: choice(GOVERNANCE_MATURITY_CHOICES),
  governance_owners: choices(GOVERNANCE_OWNER_CHOICES),
  governance_owners_other: text,
  governance_forums: choices(GOVERNANCE_FORUM_CHOICES),
  governance_forums_other: text,
  // Diagnose / existing programs
  existing_programs: choices(EXISTING_PROGRAM_CHOICES),
  existing_programs_comments: text,
  // Diagnose / managerial maturity
  manager_training: choices(MANAGER_TRAINING_CHOICES),
  manager_confidence: choice(MANAGER_CONFIDENCE_CHOICES),
  // Diagnose / priority issues
  priority_issues: choices(PRIORITY_ISSUE_CHOICES),
  priority_issues_other: text,
  priority_issues_comments: text,
  // Diagnose / company strengths
  company_strengths: choices(COMPANY_STRENGTH_CHOICES),
  company_strengths_other: text,
  company_strengths_comments: text,
  // Diagnose / identified barriers
  identified_barriers: choices(IDENTIFIED_BARRIER_CHOICES),
  identified_barriers_other: text,
  identified_barriers_comments: text,
  // Diagnose / urgency
  urgency_level: choice(URGENCY_LEVEL_CHOICES),
  urgency_comments: text,
  // Diagnose / priorities expressed by the client
  client_priority_1: text,
  client_priority_2: text,
  client_priority_3: text,
  // Diagnose / IMPACT 360 profile
  impact_awareness: profileLevel,
  impact_management: profileLevel,
  impact_prevention: profileLevel,
  impact_steering: profileLevel,
  impact_culture: profileLevel,
  impact_measurement: profileLevel,
  overall_profile_level: profileLevel,
  overall_profile_comments: text,
  // Recommend / diagnostic summary
  diagnostic_summary: text,
  // Recommend / support objectives
  support_objectives: choices(SUPPORT_OBJECTIVE_CHOICES),
  support_objectives_other: text,
  // Recommend / journey
  journey_steps: choices(JOURNEY_STEP_CHOICES),
  recommended_path: choices(RECOMMENDED_PATH_CHOICES),
  // Recommend / consultant recommendations
  consultant_recommendations: choices(CONSULTANT_RECOMMENDATION_CHOICES),
  consultant_recommendations_other: text,
  // Recommend / audiences
  target_audiences: choices(TARGET_AUDIENCE_CHOICES),
  target_audience_other: text,
  // Recommend / deployment priority
  deployment_short_term: choices(DEPLOYMENT_SHORT_TERM_CHOICES),
  deployment_medium_term: choices(DEPLOYMENT_MEDIUM_TERM_CHOICES),
  deployment_long_term: choices(DEPLOYMENT_LONG_TERM_CHOICES),
  // Recommend / benefits, success factors and watch points
  expected_benefits: text,
  success_factors: choices(SUCCESS_FACTOR_CHOICES),
  success_factors_other: text,
  watch_points: text,
  // Concretize / interview summary
  interview_summary: text,
  // Concretize / influence of each decider, next to their email column
  ...Object.fromEntries(
    DECIDER_ROLES.map((role) => [
      `decider_${role}_influence`,
      choice(INFLUENCE_LEVEL_CHOICES),
    ]),
  ),
  // Concretize / decision process
  decision_process: choices(DECISION_PROCESS_CHOICES),
  decision_process_other: text,
  expected_decision_date: date,
  // Concretize / budget
  budget_status: choice(BUDGET_STATUS_CHOICES),
  estimated_budget: { kind: "amount" },
  // Concretize / documents to send
  documents_to_send: choices(DOCUMENT_CHOICES),
  documents_to_send_other: text,
  // Concretize / next follow-up
  next_follow_up_date: date,
  next_follow_up_mode: choice(FOLLOW_UP_MODE_CHOICES),
  // Concretize / opportunity rating, from 1 to 5 stars
  opportunity_rating: { kind: "level", min: 1, max: 5 },
  opportunity_rating_comments: text,
  // Concretize / file follow-up
  follow_up_status: choices(FOLLOW_UP_STATUS_CHOICES),
  follow_up_comments: text,
  // Concretize / development potential
  development_opportunities: choices(DEVELOPMENT_OPPORTUNITY_CHOICES),
  development_opportunities_other: text,
  development_comments: text,
  // Concretize / checklist and closing
  closing_checklist: choices(CLOSING_CHECKLIST_CHOICES),
  closed_at: date,
  next_action: text,
};

/** CSV column holding the email of the contact filling a decider role. */
export const deciderEmailColumn = (role: string) => `decider_${role}_email`;

/** CSV column holding the id of the contact filling a decider role. */
export const deciderContactField = (role: string) =>
  `decider_${role}_contact_id`;
