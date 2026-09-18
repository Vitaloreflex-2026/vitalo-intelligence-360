import type { Identifier, RaRecord } from "ra-core";
import type { ComponentType } from "react";

import type {
  COMPANY_CREATED,
  CONTACT_CREATED,
  CONTACT_NOTE_CREATED,
  DEAL_CREATED,
  DEAL_NOTE_CREATED,
} from "./consts";

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type SalesFormData = {
  avatar?: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  administrator: boolean;
  disabled: boolean;
};

export type Sale = {
  first_name: string;
  last_name: string;
  administrator: boolean;
  avatar?: RAFile;
  disabled?: boolean;
  user_id: string;

  /** Hex fill identifying this consultant/trainer in the dashboard calendar. */
  color?: string | null;

  /**
   * This is a copy of the user's email, to make it easier to handle by react admin
   * DO NOT UPDATE this field directly, it should be updated by the backend
   */
  email: string;

  /**
   * This is used by the fake rest provider to store the password
   * DO NOT USE this field in your code besides the fake rest provider
   * @deprecated
   */
  password?: string;
} & Pick<RaRecord, "id">;

/** Headcount brackets: <50, 50-100, 100-250, 250-500, +500. */
export type CompanySize = 50 | 100 | 250 | 500 | 1000;

/** Fixed relationship statuses shared by contacts and deals. */
export type RelationshipStatus = "prospect" | "client" | "partner";

/** A user-extensible option list entry (deal origins, objectives, meeting modes/types). */
export type Choice = {
  category: string;
  label: string;
  /** Only meaningful for the `user_document_type` category. */
  requires_renewal?: boolean;
} & Pick<RaRecord, "id">;

/**
 * An administrative paper filed by a consultant (ID card, bank details…).
 * `type` holds the `user_document_type` choice LABEL, and there is at most one
 * document per (consultant, type) — re-uploading replaces the previous file.
 */
export type SaleDocument = {
  sales_id: Identifier;
  type: string;
  file: RAFile;
  created_at: string;
} & Pick<RaRecord, "id">;

export type Company = {
  name: string;
  logo: RAFile;
  sector: string;
  size: CompanySize;
  linkedin_url: string;
  website: string;
  phone_number: string;
  address: string;
  zipcode: string;
  city: string;
  state_abbr: string;
  sales_id?: Identifier;
  created_at: string;
  description: string;
  revenue: string;
  tax_identifier: string;
  country: string;
  context_links?: string[];
  nb_contacts?: number;
  nb_deals?: number;
  nb_sites?: number | null;
} & Pick<RaRecord, "id">;

export type EmailAndType = {
  email: string;
  type: "Work" | "Home" | "Other";
};

export type PhoneNumberAndType = {
  number: string;
  type: "Work" | "Home" | "Other";
};

export type Contact = {
  first_name: string;
  last_name: string;
  title: string;
  company_id?: Identifier | null;
  email_jsonb: EmailAndType[];
  avatar?: Partial<RAFile>;
  linkedin_url?: string | null;
  first_seen: string;
  last_seen: string;
  has_newsletter: boolean;
  tags: number[];
  gender: string;
  sales_id?: Identifier;
  status: string;
  background: string;
  phone_jsonb: PhoneNumberAndType[];
  nb_tasks?: number;
  company_name?: string;
  company_start_date?: string | null;
  decision_role?: string | null;
  relationship_status?: RelationshipStatus | null;
  linked_contact_ids?: Identifier[] | null;
} & Pick<RaRecord, "id">;

export type ContactNote = {
  contact_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  status: string;
  attachments?: AttachmentNote[];
} & Pick<RaRecord, "id">;

/**
 * Assessment ("etat des lieux") — a review attached to a company.
 * Business columns are not defined yet; only the company link exists so far.
 */
export type Assessment = {
  company_id: Identifier;
  created_at: string;
  // Diagnose page of the discovery form; every answer is optional.
  governance_maturity?: string | null;
  governance_owners?: string[] | null;
  governance_owners_other?: string | null;
  governance_forums?: string[] | null;
  governance_forums_other?: string | null;
  existing_programs?: string[] | null;
  existing_programs_comments?: string | null;
  manager_training?: string[] | null;
  manager_confidence?: string | null;
  priority_issues?: string[] | null;
  priority_issues_other?: string | null;
  priority_issues_comments?: string | null;
  company_strengths?: string[] | null;
  company_strengths_other?: string | null;
  company_strengths_comments?: string | null;
  identified_barriers?: string[] | null;
  identified_barriers_other?: string | null;
  identified_barriers_comments?: string | null;
  urgency_level?: string | null;
  urgency_comments?: string | null;
  client_priority_1?: string | null;
  client_priority_2?: string | null;
  client_priority_3?: string | null;
  impact_awareness?: number | null;
  impact_management?: number | null;
  impact_prevention?: number | null;
  impact_steering?: number | null;
  impact_culture?: number | null;
  impact_measurement?: number | null;
  overall_profile_level?: number | null;
  overall_profile_comments?: string | null;
  // Recommend page of the discovery form; every answer is optional.
  diagnostic_summary?: string | null;
  support_objectives?: string[] | null;
  support_objectives_other?: string | null;
  journey_steps?: string[] | null;
  recommended_path?: string[] | null;
  consultant_recommendations?: string[] | null;
  consultant_recommendations_other?: string | null;
  target_audiences?: string[] | null;
  target_audience_other?: string | null;
  deployment_short_term?: string[] | null;
  deployment_medium_term?: string[] | null;
  deployment_long_term?: string[] | null;
  expected_benefits?: string | null;
  success_factors?: string[] | null;
  success_factors_other?: string | null;
  watch_points?: string | null;
  // Concretize page of the discovery form; every answer is optional.
  interview_summary?: string | null;
  decider_management_contact_id?: Identifier | null;
  decider_management_influence?: string | null;
  decider_hr_contact_id?: Identifier | null;
  decider_hr_influence?: string | null;
  decider_manager_contact_id?: Identifier | null;
  decider_manager_influence?: string | null;
  decider_cse_contact_id?: Identifier | null;
  decider_cse_influence?: string | null;
  decider_other_contact_id?: Identifier | null;
  decider_other_influence?: string | null;
  decision_process?: string[] | null;
  decision_process_other?: string | null;
  expected_decision_date?: string | null;
  budget_status?: string | null;
  estimated_budget?: number | null;
  next_steps?: AssessmentNextStep[] | null;
  documents_to_send?: string[] | null;
  documents_to_send_other?: string | null;
  next_follow_up_date?: string | null;
  next_follow_up_mode?: string | null;
  opportunity_rating?: number | null;
  opportunity_rating_comments?: string | null;
  follow_up_status?: string[] | null;
  follow_up_comments?: string | null;
  development_opportunities?: string[] | null;
  development_opportunities_other?: string | null;
  development_comments?: string | null;
  closing_checklist?: string[] | null;
  closed_by_id?: Identifier | null;
  closed_at?: string | null;
  next_action?: string | null;
} & Pick<RaRecord, "id">;

/** One row of the "Next steps" table of an assessment. */
export type AssessmentNextStep = {
  action?: string | null;
  owner_id?: Identifier | null;
  due_date?: string | null;
};

export type Deal = {
  name: string;
  company_id: Identifier;
  contact_ids: Identifier[];
  category: string;
  stage: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  expected_closing_date: string;
  sales_id: Identifier;
  index: number;
  confidentiality?: RelationshipStatus | null;
  reference?: string | null;
  origin?: string | null;
  motivation?: string | null;
  objectives?: string[] | null;
  other_expectations?: string | null;
} & Pick<RaRecord, "id">;

export type DealNote = {
  deal_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  attachments?: AttachmentNote[];

  // This is defined for compatibility with `ContactNote`
  status?: undefined;
} & Pick<RaRecord, "id">;

export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type Task = {
  contact_id: Identifier;
  type: string;
  text: string;
  due_date: string;
  done_date?: string | null;
  sales_id?: Identifier;
  location?: string | null;
  mode?: string | null;
  /** Length of the meeting in minutes, used to size its calendar block. */
  duration_minutes?: number;
} & Pick<RaRecord, "id">;

export type ActivityCompanyCreated = {
  type: typeof COMPANY_CREATED;
  company_id: Identifier;
  company: Company;
  sales_id: Identifier;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactCreated = {
  type: typeof CONTACT_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  contact: Contact;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactNoteCreated = {
  type: typeof CONTACT_NOTE_CREATED;
  sales_id?: Identifier;
  contactNote: ContactNote;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityDealCreated = {
  type: typeof DEAL_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  deal: Deal;
  date: string;
};

export type ActivityDealNoteCreated = {
  type: typeof DEAL_NOTE_CREATED;
  sales_id?: Identifier;
  dealNote: DealNote;
  date: string;
};

export type Activity = RaRecord &
  (
    | ActivityCompanyCreated
    | ActivityContactCreated
    | ActivityContactNoteCreated
    | ActivityDealCreated
    | ActivityDealNoteCreated
  );

export interface RAFile {
  src: string;
  title: string;
  path?: string;
  rawFile: File;
  type?: string;
}

export type AttachmentNote = RAFile;

export interface LabeledValue {
  value: string;
  label: string;
}

export type DealStage = LabeledValue;

export interface NoteStatus extends LabeledValue {
  color: string;
}

export interface ContactGender {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}
