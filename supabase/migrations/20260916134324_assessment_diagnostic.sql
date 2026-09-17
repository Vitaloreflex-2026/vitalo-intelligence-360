alter table "public"."assessments" add column "client_priority_1" text;

alter table "public"."assessments" add column "client_priority_2" text;

alter table "public"."assessments" add column "client_priority_3" text;

alter table "public"."assessments" add column "company_strengths" text[];

alter table "public"."assessments" add column "company_strengths_comments" text;

alter table "public"."assessments" add column "company_strengths_other" text;

alter table "public"."assessments" add column "existing_programs" text[];

alter table "public"."assessments" add column "existing_programs_comments" text;

alter table "public"."assessments" add column "governance_forums" text[];

alter table "public"."assessments" add column "governance_forums_other" text;

alter table "public"."assessments" add column "governance_maturity" text;

alter table "public"."assessments" add column "governance_owners" text[];

alter table "public"."assessments" add column "governance_owners_other" text;

alter table "public"."assessments" add column "identified_barriers" text[];

alter table "public"."assessments" add column "identified_barriers_comments" text;

alter table "public"."assessments" add column "identified_barriers_other" text;

alter table "public"."assessments" add column "impact_awareness" smallint;

alter table "public"."assessments" add column "impact_culture" smallint;

alter table "public"."assessments" add column "impact_management" smallint;

alter table "public"."assessments" add column "impact_measurement" smallint;

alter table "public"."assessments" add column "impact_prevention" smallint;

alter table "public"."assessments" add column "impact_steering" smallint;

alter table "public"."assessments" add column "manager_confidence" text;

alter table "public"."assessments" add column "manager_training" text[];

alter table "public"."assessments" add column "overall_profile_comments" text;

alter table "public"."assessments" add column "overall_profile_level" smallint;

alter table "public"."assessments" add column "priority_issues" text[];

alter table "public"."assessments" add column "priority_issues_comments" text;

alter table "public"."assessments" add column "priority_issues_other" text;

alter table "public"."assessments" add column "urgency_comments" text;

alter table "public"."assessments" add column "urgency_level" text;


