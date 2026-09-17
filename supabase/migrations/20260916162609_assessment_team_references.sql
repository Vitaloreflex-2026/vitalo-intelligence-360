alter table "public"."assessments" drop column "closed_by";

alter table "public"."assessments" add column "closed_by_id" bigint;

alter table "public"."assessments" add constraint "assessments_closed_by_id_fkey" FOREIGN KEY (closed_by_id) REFERENCES public.sales(id) not valid;

alter table "public"."assessments" validate constraint "assessments_closed_by_id_fkey";


