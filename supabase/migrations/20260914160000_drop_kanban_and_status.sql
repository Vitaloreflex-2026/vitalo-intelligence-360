--
-- The deal Kanban is replaced by a plain list, so the board's own columns go
-- with it (stage, amount, index) along with the deal name: a deal is now
-- identified by its company and its reference.
--
-- The hot/warm/cold status is dropped from both contacts and their notes.
--

drop view if exists public.contacts_summary;

alter table public.deals drop column if exists name;
alter table public.deals drop column if exists stage;
alter table public.deals drop column if exists amount;
alter table public.deals drop column if exists index;

alter table public.contacts drop column if exists status;
alter table public.contact_notes drop column if exists status;

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

grant all on table public.contacts_summary to anon;
grant all on table public.contacts_summary to authenticated;
grant all on table public.contacts_summary to service_role;
