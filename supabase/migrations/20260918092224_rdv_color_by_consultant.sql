alter table "public"."choices" drop column "color";

alter table "public"."sales" add column "color" text;


  create policy "Enable update for admins"
  on "public"."sales"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());




-- Seed a distinct calendar color per consultant/trainer, spread over the RDV
-- palette (src/components/atomic-crm/misc/rdvColors.ts) so an existing team
-- starts collision-free instead of relying on the name hash fallback.
with palette as (
    select array[
        '#cfe3f7', '#ffe0b2', '#d6f0d0', '#f7d6e0',
        '#e2d9f3', '#ffd8cc', '#cfeceb', '#e8e0cc'
    ] as colors
), numbered as (
    select id, (row_number() over (order by id) - 1) as position
    from public.sales
)
update public.sales
set color = (select colors[(numbered.position % array_length(colors, 1)) + 1] from palette)
from numbered
where numbered.id = public.sales.id;
