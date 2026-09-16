import type { ComponentType, SVGProps } from "react";
import { Mail, Phone, Users, Video } from "lucide-react";

/**
 * Option lists of the "Concretize" page of the VitalO IMPACT 360 discovery form.
 * Same convention as the other pages: the id is stored, the name is an i18n key.
 */
const buildChoices = (group: string, ids: string[]) =>
  ids.map((id) => ({
    id,
    name: `resources.assessments.concretize.${group}.${id}`,
  }));

/** The five decision makers listed on the form, in printed order. */
export const DECIDER_ROLES = [
  "management",
  "hr",
  "manager",
  "cse",
  "other",
] as const;

export const INFLUENCE_LEVEL_CHOICES = buildChoices("influence_levels", [
  "high",
  "medium",
  "low",
]);

export const DECISION_PROCESS_CHOICES = buildChoices("decision_process", [
  "consultation",
  "call_for_tenders",
  "management_decision",
  "budget_approval",
  "cse_vote",
  "other",
]);

export const BUDGET_STATUS_CHOICES = buildChoices("budget_status", [
  "approved",
  "in_progress",
  "to_be_created",
  "unknown",
]);

export const DOCUMENT_CHOICES = buildChoices("documents_to_send", [
  "brochure",
  "commercial_proposal",
  "psmt_program",
  "psmm_program",
  "pssm_documentation",
  "client_references",
  "quote",
  "agreement",
  "barometer",
  "workshops_conferences",
  "other",
]);

type FollowUpMode = {
  id: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** The follow-up modes keep the pictogram they have on the paper form. */
export const FOLLOW_UP_MODE_CHOICES: FollowUpMode[] = [
  { id: "email", icon: Mail },
  { id: "phone", icon: Phone },
  { id: "video", icon: Video },
  { id: "in_person", icon: Users },
].map(({ id, icon }) => ({
  id,
  icon,
  name: `resources.assessments.concretize.follow_up_modes.${id}`,
}));

/** The opportunity scale, from five stars down to one. */
export const OPPORTUNITY_RATING_CHOICES = [5, 4, 3, 2, 1].map((stars) => ({
  id: String(stars),
  stars,
  name: `resources.assessments.concretize.opportunity_ratings.stars_${stars}`,
}));

export const FOLLOW_UP_STATUS_CHOICES = buildChoices("follow_up_status", [
  "discovery_done",
  "proposal_sent",
  "decision_pending",
  "support_approved",
  "project_postponed",
  "file_closed",
]);

export const DEVELOPMENT_OPPORTUNITY_CHOICES = buildChoices(
  "development_opportunities",
  [
    "national_rollout",
    "several_sites",
    "manager_training",
    "pssm",
    "qvct_workshops",
    "conferences",
    "annual_barometer",
    "three_year_support",
    "vitalo_app",
    "other",
  ],
);

export const CLOSING_CHECKLIST_CHOICES = buildChoices("closing_checklist", [
  "crm_complete",
  "documents_sent",
  "follow_up_scheduled",
  "file_archived",
]);
