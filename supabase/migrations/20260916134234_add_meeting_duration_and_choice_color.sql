alter table "public"."choices" add column "color" text;

alter table "public"."tasks" add column "duration_minutes" integer not null default 60;


-- Seed a distinguishable colour for each meeting type shipped with the CRM.
-- The dashboard calendar renders one meeting per coloured block, and at the
-- widths it runs in the type label does not fit inside the block, so the
-- colour is the only carrier of the type. The tag palette is too low-contrast
-- for that: these hues are spaced far enough apart to stay separable.
update public.choices set color = mapped.color
from (values
    ('Premier contact', '#cfe3f7'),
    ('Rendez-vous découverte', '#ffe0b2'),
    ('Rendez-vous de suivi', '#d6f0d0'),
    ('Restitution', '#f7d6e0'),
    ('Bilan annuel', '#e2d9f3'),
    ('Préparation d''une proposition', '#ffd8cc'),
    ('Lancement de mission', '#cfeceb')
) as mapped(label, color)
where public.choices.category = 'rdv_type'
  and public.choices.label = mapped.label
  and public.choices.color is null;
