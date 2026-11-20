-- Deleting a user (auth.users) now deletes their sales row, and everything that
-- pointed at that row is kept without an owner instead of blocking the delete.

alter table "public"."sales" drop constraint "sales_user_id_fkey";
alter table "public"."sales" add constraint "sales_user_id_fkey" foreign key (user_id) references auth.users(id) on delete cascade;

alter table "public"."assessments" drop constraint "assessments_closed_by_id_fkey";
alter table "public"."assessments" add constraint "assessments_closed_by_id_fkey" foreign key (closed_by_id) references public.sales(id) on delete set null;

alter table "public"."companies" drop constraint "companies_sales_id_fkey";
alter table "public"."companies" add constraint "companies_sales_id_fkey" foreign key (sales_id) references public.sales(id) on delete set null;

alter table "public"."contacts" drop constraint "contacts_sales_id_fkey";
alter table "public"."contacts" add constraint "contacts_sales_id_fkey" foreign key (sales_id) references public.sales(id) on delete set null;

-- Was "on delete cascade": deleting a user would have erased their notes.
alter table "public"."contact_notes" drop constraint "contactNotes_sales_id_fkey";
alter table "public"."contact_notes" add constraint "contactNotes_sales_id_fkey" foreign key (sales_id) references public.sales(id) on update cascade on delete set null;

alter table "public"."deals" drop constraint "deals_sales_id_fkey";
alter table "public"."deals" add constraint "deals_sales_id_fkey" foreign key (sales_id) references public.sales(id) on delete set null;

alter table "public"."deal_notes" drop constraint "dealNotes_sales_id_fkey";
alter table "public"."deal_notes" add constraint "dealNotes_sales_id_fkey" foreign key (sales_id) references public.sales(id) on delete set null;

set check_function_bodies = off;

-- Security definer: a user is deleted from auth.users by the auth service role,
-- which has no rights on these tables.
CREATE OR REPLACE FUNCTION public.remove_deleted_sale_from_arrays()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.tasks SET sales_ids = array_remove(sales_ids, OLD.id)
  WHERE sales_ids @> ARRAY[OLD.id];
  UPDATE public.deals SET trainer_ids = array_remove(trainer_ids, OLD.id)
  WHERE trainer_ids @> ARRAY[OLD.id];
  RETURN OLD;
END;
$function$
;

grant all on function public.remove_deleted_sale_from_arrays() to anon;
grant all on function public.remove_deleted_sale_from_arrays() to authenticated;
grant all on function public.remove_deleted_sale_from_arrays() to service_role;

CREATE TRIGGER remove_deleted_sale_from_arrays AFTER DELETE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.remove_deleted_sale_from_arrays();
