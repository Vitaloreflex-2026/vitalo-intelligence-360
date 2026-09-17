alter table "public"."assessments" drop column "decider_cse_name";

alter table "public"."assessments" drop column "decider_hr_name";

alter table "public"."assessments" drop column "decider_management_name";

alter table "public"."assessments" drop column "decider_manager_name";

alter table "public"."assessments" drop column "decider_other_name";

alter table "public"."assessments" add column "decider_cse_contact_id" bigint;

alter table "public"."assessments" add column "decider_hr_contact_id" bigint;

alter table "public"."assessments" add column "decider_management_contact_id" bigint;

alter table "public"."assessments" add column "decider_manager_contact_id" bigint;

alter table "public"."assessments" add column "decider_other_contact_id" bigint;

alter table "public"."assessments" add constraint "assessments_decider_cse_contact_id_fkey" FOREIGN KEY (decider_cse_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL not valid;

alter table "public"."assessments" validate constraint "assessments_decider_cse_contact_id_fkey";

alter table "public"."assessments" add constraint "assessments_decider_hr_contact_id_fkey" FOREIGN KEY (decider_hr_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL not valid;

alter table "public"."assessments" validate constraint "assessments_decider_hr_contact_id_fkey";

alter table "public"."assessments" add constraint "assessments_decider_management_contact_id_fkey" FOREIGN KEY (decider_management_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL not valid;

alter table "public"."assessments" validate constraint "assessments_decider_management_contact_id_fkey";

alter table "public"."assessments" add constraint "assessments_decider_manager_contact_id_fkey" FOREIGN KEY (decider_manager_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL not valid;

alter table "public"."assessments" validate constraint "assessments_decider_manager_contact_id_fkey";

alter table "public"."assessments" add constraint "assessments_decider_other_contact_id_fkey" FOREIGN KEY (decider_other_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL not valid;

alter table "public"."assessments" validate constraint "assessments_decider_other_contact_id_fkey";


