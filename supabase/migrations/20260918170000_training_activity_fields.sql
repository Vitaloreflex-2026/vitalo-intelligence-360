-- Training activity fields feeding the yearly BPF (bilan pedagogique et
-- financier) and the activity dashboard.

alter table "public"."companies" add column "nb_trainings_delivered" integer;
alter table "public"."companies" add column "training_date" date;
alter table "public"."companies" add column "quote_approved" boolean;
alter table "public"."companies" add column "service_invoiced" boolean;

alter table "public"."contacts" add column "sponsor_role" text;

alter table "public"."deals" add column "trainer_ids" bigint[];
alter table "public"."deals" add column "training_type" text;
alter table "public"."deals" add column "nb_trained_managers" integer;
alter table "public"."deals" add column "nb_trained_non_managers" integer;
alter table "public"."deals" add column "hours_delivered" numeric;
alter table "public"."deals" add column "qvct_workshop_type" text;
alter table "public"."deals" add column "passport_eligible" boolean;
alter table "public"."deals" add column "portal_data_sent" boolean;
alter table "public"."deals" add column "portal_data_sent_at" date;
alter table "public"."deals" add column "qualiopi" boolean;
alter table "public"."deals" add column "funding_type" text;
alter table "public"."deals" add column "quote_signed" boolean;
alter table "public"."deals" add column "quote_signed_at" date;
alter table "public"."deals" add column "agreement_signed" boolean;
alter table "public"."deals" add column "agreement_signed_at" date;
alter table "public"."deals" add column "amount_invoiced_incl_tax" numeric;
alter table "public"."deals" add column "cost_training" numeric;
alter table "public"."deals" add column "cost_teaching" numeric;
alter table "public"."deals" add column "cost_subcontracting" numeric;
alter table "public"."deals" add column "cost_travel" numeric;
alter table "public"."deals" add column "cost_materials" numeric;
alter table "public"."deals" add column "opco_name" text;
alter table "public"."deals" add column "opco_contact_name" text;
alter table "public"."deals" add column "opco_contact_phone" text;
alter table "public"."deals" add column "opco_contact_email" text;
alter table "public"."deals" add column "opco_file_submitted" boolean;
alter table "public"."deals" add column "opco_file_submitted_at" date;
alter table "public"."deals" add column "appropriation_rate" numeric;
alter table "public"."deals" add column "satisfaction_rate" numeric;

-- The summary views list their columns explicitly, and the new ones sit before
-- the aggregates, so they are recreated rather than replaced in place.
drop view if exists public.companies_summary;
drop view if exists public.contacts_summary;

create or replace view public.companies_summary with (security_invoker = on) as
select
    c.id,
    c.created_at,
    c.name,
    c.sector,
    c.size,
    c.linkedin_url,
    c.website,
    c.phone_number,
    c.address,
    c.zipcode,
    c.city,
    c.state_abbr,
    c.sales_id,
    c.context_links,
    c.country,
    c.description,
    c.revenue,
    c.tax_identifier,
    c.logo,
    c.nb_sites,
    c.nb_trainings_delivered,
    c.training_date,
    c.quote_approved,
    c.service_invoiced,
    count(distinct d.id) as nb_deals,
    count(distinct co.id) as nb_contacts
from public.companies c
    left join public.deals d on c.id = d.company_id
    left join public.contacts co on c.id = co.company_id
group by c.id;

create or replace view public.contacts_summary with (security_invoker = on) as
select
    co.id,
    co.first_name,
    co.last_name,
    co.gender,
    co.title,
    co.background,
    co.avatar,
    co.first_seen,
    co.last_seen,
    co.has_newsletter,
    co.status,
    co.tags,
    co.company_id,
    co.sales_id,
    co.linkedin_url,
    co.email_jsonb,
    co.phone_jsonb,
    co.company_start_date,
    co.decision_role,
    co.relationship_status,
    co.linked_contact_ids,
    co.sponsor_role,
    (jsonb_path_query_array(co.email_jsonb, '$[*]."email"'))::text as email_fts,
    (jsonb_path_query_array(co.phone_jsonb, '$[*]."number"'))::text as phone_fts,
    c.name as company_name,
    count(distinct t.id) filter (where t.done_date is null) as nb_tasks
from public.contacts co
    left join public.tasks t on co.id = t.contact_id
    left join public.companies c on co.company_id = c.id
group by co.id, c.name;

grant all on table public.companies_summary to anon;
grant all on table public.companies_summary to authenticated;
grant all on table public.companies_summary to service_role;

grant all on table public.contacts_summary to anon;
grant all on table public.contacts_summary to authenticated;
grant all on table public.contacts_summary to service_role;
