drop policy "Enable delete for owner" on "public"."sales_documents";

drop policy "Enable insert for owner" on "public"."sales_documents";

drop policy "Enable update for owner" on "public"."sales_documents";


  create policy "Enable delete for owner and admins"
  on "public"."sales_documents"
  as permissive
  for delete
  to authenticated
using ((public.is_own_sale(sales_id) OR public.is_admin()));



  create policy "Enable insert for owner and admins"
  on "public"."sales_documents"
  as permissive
  for insert
  to authenticated
with check ((public.is_own_sale(sales_id) OR public.is_admin()));



  create policy "Enable update for owner and admins"
  on "public"."sales_documents"
  as permissive
  for update
  to authenticated
using ((public.is_own_sale(sales_id) OR public.is_admin()))
with check ((public.is_own_sale(sales_id) OR public.is_admin()));
