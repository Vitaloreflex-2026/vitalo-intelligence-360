--
-- Remove the domain fields that the CRM no longer exposes:
--   companies: revenue, tax_identifier, context_links, state_abbr
--   contacts:  has_newsletter
--   deals:     category, description
--
-- The summary views select these columns explicitly, so they are dropped first
-- and recreated from supabase/schemas/03_views.sql.
--

drop view if exists public.companies_summary;
drop view if exists public.contacts_summary;

alter table public.companies drop column if exists revenue;
alter table public.companies drop column if exists tax_identifier;
alter table public.companies drop column if exists context_links;
alter table public.companies drop column if exists state_abbr;

alter table public.contacts drop column if exists has_newsletter;

alter table public.deals drop column if exists category;
alter table public.deals drop column if exists description;

create view public.companies_summary with (security_invoker = on) as
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
    c.sales_id,
    c.country,
    c.description,
    c.logo,
    c.nb_sites,
    count(distinct d.id) as nb_deals,
    count(distinct co.id) as nb_contacts
from public.companies c
    left join public.deals d on c.id = d.company_id
    left join public.contacts co on c.id = co.company_id
group by c.id;

create view public.contacts_summary with (security_invoker = on) as
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
