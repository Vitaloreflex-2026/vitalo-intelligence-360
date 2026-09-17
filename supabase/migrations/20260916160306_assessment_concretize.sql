alter table "public"."assessments" add column "budget_status" text;

alter table "public"."assessments" add column "closed_at" date;

alter table "public"."assessments" add column "closed_by" text;

alter table "public"."assessments" add column "closing_checklist" text[];

alter table "public"."assessments" add column "decider_cse_influence" text;

alter table "public"."assessments" add column "decider_cse_name" text;

alter table "public"."assessments" add column "decider_hr_influence" text;

alter table "public"."assessments" add column "decider_hr_name" text;

alter table "public"."assessments" add column "decider_management_influence" text;

alter table "public"."assessments" add column "decider_management_name" text;

alter table "public"."assessments" add column "decider_manager_influence" text;

alter table "public"."assessments" add column "decider_manager_name" text;

alter table "public"."assessments" add column "decider_other_influence" text;

alter table "public"."assessments" add column "decider_other_name" text;

alter table "public"."assessments" add column "decision_process" text[];

alter table "public"."assessments" add column "decision_process_other" text;

alter table "public"."assessments" add column "development_comments" text;

alter table "public"."assessments" add column "development_opportunities" text[];

alter table "public"."assessments" add column "development_opportunities_other" text;

alter table "public"."assessments" add column "documents_to_send" text[];

alter table "public"."assessments" add column "documents_to_send_other" text;

alter table "public"."assessments" add column "estimated_budget" numeric;

alter table "public"."assessments" add column "expected_decision_date" date;

alter table "public"."assessments" add column "follow_up_comments" text;

alter table "public"."assessments" add column "follow_up_status" text[];

alter table "public"."assessments" add column "interview_summary" text;

alter table "public"."assessments" add column "next_action" text;

alter table "public"."assessments" add column "next_follow_up_date" date;

alter table "public"."assessments" add column "next_follow_up_mode" text;

alter table "public"."assessments" add column "next_steps" jsonb;

alter table "public"."assessments" add column "opportunity_rating" smallint;

alter table "public"."assessments" add column "opportunity_rating_comments" text;


