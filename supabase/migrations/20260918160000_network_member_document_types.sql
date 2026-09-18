-- The papers every VitalOreflex network member must file.
--
-- This replaces the earlier placeholder list wholesale. Every label changed, and
-- `sales_documents.type` stores the label, so the already filed papers no longer
-- match any expected type: they are dropped along with the types they belonged
-- to and members re-file them. None of these expire on a timer — a member
-- replaces a paper when it lapses — so `requires_renewal` stays false.
delete from public.sales_documents;

delete from public.choices where category = 'user_document_type';

insert into public.choices (category, label, requires_renewal) values
    ('user_document_type', 'Certificat d''immatriculation de - de 3 mois', false),
    ('user_document_type', 'CV professionnel', false),
    ('user_document_type', 'Attestation URSSAF (à jour des cotisations)', false),
    ('user_document_type', 'Attestation d''assurance en cours de validité', false),
    ('user_document_type', 'CNI recto/verso', false),
    ('user_document_type', 'IBAN professionnel', false)
on conflict (category, label) do nothing;
