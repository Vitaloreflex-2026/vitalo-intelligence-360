-- Trainers without a CRM account: a contract lists them by name, picked from
-- the `external_trainer` choices, next to the account-backed `trainer_ids`.

alter table "public"."deals" add column "external_trainers" text[];

insert into public.choices (category, label) values
    ('external_trainer', 'Joëlle Fernandez'),
    ('external_trainer', 'Lauriane Forest')
on conflict (category, label) do nothing;
