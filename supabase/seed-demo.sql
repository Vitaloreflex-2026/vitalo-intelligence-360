--
-- Local demo seed — realistic CRM data for development.
--
-- Run it with `make seed` (or pipe it to psql on the local database). It is NOT
-- picked up by `supabase db reset`: only `supabase/seed.sql` (the reference data)
-- is, so the e2e instance stays empty.
--
-- DESTRUCTIVE: it wipes tags, companies, contacts, deals, notes and tasks before
-- inserting, so it can be re-run at will. It never touches `sales`, `auth.users`,
-- `choices`, `configuration` or `favicons_excluded_domains`.
--
-- Ownership: every seeded row is assigned to the first sales account. If the
-- database has none (fresh `supabase db reset`), a demo administrator is created:
--     demo@vitalo.test / demo1234
--
-- The `sector`, `origin`, `objectives`, `type` and `mode` values below are the
-- literal labels seeded in `choices` — accents included, since the app matches
-- them by label.
--

begin;

--
-- 1. Owner — reuse the first sales account, or create a demo administrator.
--
do $$
declare
    demo_user_id uuid := gen_random_uuid();
begin
    if exists (select 1 from public.sales) then
        return;
    end if;

    -- `on_auth_user_created` turns this row into the matching public.sales row.
    --
    -- The four token columns have no column default, and GoTrue reads them into
    -- non-nullable Go strings: leaving them NULL makes every sign-in fail with
    -- "Database error querying schema". They must be inserted as empty strings.
    insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change_token_new, email_change,
        created_at, updated_at
    ) values (
        '00000000-0000-0000-0000-000000000000', demo_user_id, 'authenticated', 'authenticated',
        'demo@vitalo.test', extensions.crypt('demo1234', extensions.gen_salt('bf')),
        now(), '{"provider":"email","providers":["email"]}'::jsonb,
        '{"first_name":"Camille","last_name":"Berger"}'::jsonb,
        '', '', '', '',
        now(), now()
    );

    insert into auth.identities (
        provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
        demo_user_id::text, demo_user_id,
        format('{"sub":"%s","email":"demo@vitalo.test","email_verified":true,"phone_verified":false}', demo_user_id)::jsonb,
        'email', now(), now(), now()
    );

    raise notice 'Created demo administrator demo@vitalo.test / demo1234';
end
$$;

--
-- 2. Reset the business tables. FK cascades would cover most of it, but being
--    explicit keeps the order obvious and the identity sequences easy to reset.
--
delete from public.tasks;
delete from public.contact_notes;
delete from public.deal_notes;
delete from public.deals;
delete from public.contacts;
delete from public.companies;
delete from public.tags;

--
-- 3. Tags.
--
insert into public.tags (id, name, color) values
    (1, 'CSE',            '#eddcd2'),
    (2, 'grand-compte',   '#fff1e6'),
    (3, 'prescripteur',   '#fde2e4'),
    (4, 'salon',          '#fad2e1'),
    (5, 'multi-sites',    '#c5dedd'),
    (6, 'à-relancer',     '#dbe7e4');

--
-- 4. Companies. `company_saved` derives the logo from the website domain.
--    `size` must be one of the app brackets: 50, 100, 250, 500, 1000.
--
insert into public.companies (id, name, sector, size, nb_sites, website, linkedin_url, phone_number, address, zipcode, city, country, revenue, tax_identifier, description, created_at) values
    (1, 'Groupe Batilor', 'Industrie', 500, 12, 'batilor.fr', 'https://www.linkedin.com/company/batilor', '+33 4 72 18 44 10', '14 rue des Mariniers', '69007', 'Lyon', 'France', '180M', 'FR41552081317', 'Second œuvre et gros œuvre, 12 agences en région Auvergne-Rhône-Alpes. Forte sinistralité TMS sur les équipes chantier.', now() - interval '18 months'),
    (2, 'Clinique Saint-Marc', 'Santé', 250, 3, 'clinique-saint-marc.fr', 'https://www.linkedin.com/company/clinique-saint-marc', '+33 5 56 90 22 30', '8 avenue du Parc', '33000', 'Bordeaux', 'France', '46M', 'FR62438902114', 'Établissement de soins privé. Absentéisme élevé chez les soignants de nuit.', now() - interval '14 months'),
    (3, 'Novaterre Énergies', 'Énergie', 1000, 24, 'novaterre-energies.fr', 'https://www.linkedin.com/company/novaterre-energies', '+33 2 40 12 88 00', '2 quai Malakoff', '44000', 'Nantes', 'France', '620M', 'FR19402117563', 'Producteur d''énergies renouvelables. Accord QVCT signé, déploiement sur 24 sites.', now() - interval '11 months'),
    (4, 'Maison Delorme', 'Consommation de base', 100, 4, 'maison-delorme.fr', null, '+33 3 26 40 71 25', '31 rue de Vesle', '51100', 'Reims', 'France', '22M', 'FR88512446902', 'Biscuiterie familiale. Première démarche de prévention, pilotée par la direction.', now() - interval '9 months'),
    (5, 'Axelia Assurances', 'Finance', 500, 18, 'axelia.fr', 'https://www.linkedin.com/company/axelia', '+33 1 44 60 12 00', '52 boulevard Haussmann', '75009', 'Paris', 'France', '340M', 'FR33409887221', 'Mutuelle d''assurance. Plateaux téléphoniques identifiés à risque RPS.', now() - interval '7 months'),
    (6, 'TechNoveo', 'Technologies de l''information', 100, 2, 'technoveo.io', 'https://www.linkedin.com/company/technoveo', '+33 5 61 22 09 41', '5 impasse Rivals', '31000', 'Toulouse', 'France', '14M', 'FR70831204558', 'Éditeur SaaS en hypercroissance. Manageurs promus sans formation.', now() - interval '5 months'),
    (7, 'Ville de Sainte-Hélène', 'Services aux collectivités', 250, 6, 'ville-sainte-helene.fr', null, '+33 4 90 55 18 70', '1 place de la Mairie', '84000', 'Sainte-Hélène', 'France', null, null, 'Collectivité territoriale. Obligation DUERP à mettre à jour avant la fin de l''année.', now() - interval '4 months'),
    (8, 'Transports Rouvier', 'Industrie', 250, 9, 'transports-rouvier.fr', null, '+33 3 20 47 66 12', 'ZI de la Pilaterie, lot 4', '59700', 'Marcq-en-Barœul', 'France', '58M', 'FR26390115447', 'Transport routier de marchandises. Conducteurs isolés, forte rotation.', now() - interval '2 months');

--
-- 5. Contacts. The gravatar lookup trigger fires one HTTP call per row, which
--    makes a bulk seed slow (and fails offline) — switch it off for the insert.
--
alter table public.contacts disable trigger "20_contact_saved";

insert into public.contacts (id, first_name, last_name, gender, title, company_id, decision_role, relationship_status, status, tags, has_newsletter, background, company_start_date, email_jsonb, phone_jsonb, linkedin_url, first_seen, last_seen) values
    (1,  'Hélène',   'Vasseur',   'female', 'Directrice des ressources humaines', 1, 'Décideur',     'client',   'in-contract', '{2,5}', true,  'Porte le sujet TMS depuis deux ans. Veut des indicateurs chiffrés avant d''engager le budget.', '2019-03-01', '[{"email":"h.vasseur@batilor.fr","type":"Work"}]', '[{"number":"+33 4 72 18 44 12","type":"Work"},{"number":"+33 6 12 45 88 03","type":"Home"}]', 'https://www.linkedin.com/in/helene-vasseur', now() - interval '18 months', now() - interval '6 days'),
    (2,  'Marc',     'Delaunay',  'male',   'Responsable QHSE',                   1, 'Prescripteur', 'client',   'hot',         '{5}',   false, 'Notre relais opérationnel sur les chantiers. Connaît très bien le terrain.', '2016-09-15', '[{"email":"m.delaunay@batilor.fr","type":"Work"}]', '[{"number":"+33 6 74 22 10 91","type":"Work"}]', null, now() - interval '17 months', now() - interval '12 days'),
    (3,  'Sophie',   'Nguyen',    'female', 'Secrétaire du CSE',                  1, 'Influenceur',  'client',   'warm',        '{1,5}', false, 'Vigilante sur la restitution collective des résultats aux salariés.', '2014-01-06', '[{"email":"s.nguyen@batilor.fr","type":"Work"}]', '[{"number":"+33 4 72 18 44 27","type":"Work"}]', null, now() - interval '15 months', now() - interval '25 days'),
    (4,  'Bruno',    'Carpentier','male',   'Directeur général',                  2, 'Décideur',     'client',   'warm',        '{2}',   true,  'Arbitre seul les dépenses au-delà de 20 k€. Sensible au coût de l''absentéisme.', '2021-06-01', '[{"email":"b.carpentier@clinique-saint-marc.fr","type":"Work"}]', '[{"number":"+33 5 56 90 22 31","type":"Work"}]', 'https://www.linkedin.com/in/bruno-carpentier', now() - interval '14 months', now() - interval '20 days'),
    (5,  'Laure',    'Fontaine',  'female', 'Cadre de santé',                     2, 'Utilisateur',  'client',   'hot',         '{}',    false, 'Gère les plannings de nuit. Demande une action rapide sur l''équipe de nuit.', '2018-02-19', '[{"email":"l.fontaine@clinique-saint-marc.fr","type":"Work"}]', '[{"number":"+33 6 45 71 02 18","type":"Work"}]', null, now() - interval '13 months', now() - interval '3 days'),
    (6,  'Thierry',  'Aubert',    'male',   'Directeur QVCT groupe',              3, 'Décideur',     'client',   'in-contract', '{2,5}', true,  'Signataire de l''accord QVCT. Veut un dispositif homogène sur les 24 sites.', '2020-11-02', '[{"email":"t.aubert@novaterre-energies.fr","type":"Work"}]', '[{"number":"+33 2 40 12 88 04","type":"Work"},{"number":"+33 6 88 34 20 77","type":"Home"}]', 'https://www.linkedin.com/in/thierry-aubert', now() - interval '11 months', now() - interval '2 days'),
    (7,  'Nadia',    'Berrada',   'female', 'Chargée de mission prévention',      3, 'Utilisateur',  'client',   'hot',         '{5}',   false, 'Coordonne le planning des interventions site par site.', '2022-04-11', '[{"email":"n.berrada@novaterre-energies.fr","type":"Work"}]', '[{"number":"+33 6 33 90 11 47","type":"Work"}]', null, now() - interval '10 months', now() - interval '5 days'),
    (8,  'Philippe', 'Roux',      'male',   'Acheteur services généraux',         3, 'Acheteur',     'client',   'cold',        '{}',    false, 'Passage obligé pour tout marché au-delà de 50 k€. Très process.', '2017-08-28', '[{"email":"p.roux@novaterre-energies.fr","type":"Work"}]', '[{"number":"+33 2 40 12 88 61","type":"Work"}]', null, now() - interval '9 months', now() - interval '45 days'),
    (9,  'Claire',   'Mercier',   'female', 'Gérante',                            4, 'Décideur',     'prospect', 'warm',        '{6}',   true,  'Troisième génération à la tête de l''entreprise. Décide vite mais veut du concret.', '2012-01-09', '[{"email":"c.mercier@maison-delorme.fr","type":"Work"}]', '[{"number":"+33 3 26 40 71 26","type":"Work"}]', null, now() - interval '9 months', now() - interval '16 days'),
    (10, 'Julien',   'Perrot',    'male',   'Responsable production',             4, 'Utilisateur',  'prospect', 'cold',        '{}',    false, 'Craint l''arrêt de ligne pendant les ateliers. À rassurer sur le format.', '2015-05-18', '[{"email":"j.perrot@maison-delorme.fr","type":"Work"}]', '[{"number":"+33 6 21 84 55 30","type":"Work"}]', null, now() - interval '8 months', now() - interval '38 days'),
    (11, 'Isabelle', 'Lemoine',   'female', 'DRH adjointe',                       5, 'Décideur',     'prospect', 'hot',         '{2,3}', true,  'Rencontrée à Préventica. Pilote le plan de prévention RPS des plateaux.', '2019-09-02', '[{"email":"i.lemoine@axelia.fr","type":"Work"}]', '[{"number":"+33 1 44 60 12 08","type":"Work"},{"number":"+33 6 07 55 41 92","type":"Home"}]', 'https://www.linkedin.com/in/isabelle-lemoine', now() - interval '7 months', now() - interval '1 day'),
    (12, 'Franck',   'Ollivier',  'male',   'Responsable relations sociales',     5, 'Influenceur',  'prospect', 'warm',        '{1}',   false, 'Veut associer les organisations syndicales dès le cadrage.', '2013-03-25', '[{"email":"f.ollivier@axelia.fr","type":"Work"}]', '[{"number":"+33 1 44 60 12 44","type":"Work"}]', null, now() - interval '6 months', now() - interval '9 days'),
    (13, 'Amélie',   'Sarr',      'female', 'Élue CSSCT',                         5, 'Influenceur',  'prospect', 'cold',        '{1}',   false, 'Demande la restitution des résultats en commission avant toute communication.', '2020-01-13', '[{"email":"a.sarr@axelia.fr","type":"Work"}]', '[{"number":"+33 6 62 18 74 05","type":"Work"}]', null, now() - interval '6 months', now() - interval '52 days'),
    (14, 'Yanis',    'Chérif',    'male',   'Chief People Officer',               6, 'Décideur',     'prospect', 'hot',         '{3}',   true,  'Startup mindset, veut un format court et un ROI lisible.', '2021-02-01', '[{"email":"yanis@technoveo.io","type":"Work"}]', '[{"number":"+33 6 11 47 29 60","type":"Work"}]', 'https://www.linkedin.com/in/yanis-cherif', now() - interval '5 months', now() - interval '4 days'),
    (15, 'Emma',     'Bouchard',  'female', 'Office manager',                     6, 'Utilisateur',  'prospect', 'warm',        '{}',    false, 'Organise la logistique des sessions et les inscriptions.', '2022-10-03', '[{"email":"emma@technoveo.io","type":"Work"}]', '[{"number":"+33 5 61 22 09 45","type":"Work"}]', null, now() - interval '4 months', now() - interval '11 days'),
    (16, 'Gérard',   'Pineau',    'male',   'Directeur général des services',     7, 'Décideur',     'prospect', 'warm',        '{6}',   false, 'Contrainte calendaire forte : DUERP à jour avant la fin de l''exercice.', '2018-07-01', '[{"email":"dgs@ville-sainte-helene.fr","type":"Work"}]', '[{"number":"+33 4 90 55 18 72","type":"Work"}]', null, now() - interval '4 months', now() - interval '14 days'),
    (17, 'Fatima',   'Benali',    'female', 'Conseillère en prévention',          7, 'Prescripteur', 'prospect', 'hot',         '{3}',   true,  'Prépare le dossier technique et le cahier des charges du marché.', '2021-09-06', '[{"email":"f.benali@ville-sainte-helene.fr","type":"Work"}]', '[{"number":"+33 6 84 33 20 19","type":"Work"}]', null, now() - interval '3 months', now() - interval '7 days'),
    (18, 'Olivier',  'Rouvier',   'male',   'Président',                          8, 'Décideur',     'prospect', 'cold',        '{6}',   false, 'Rencontré sur un salon. Sceptique sur l''intérêt, à reconvaincre.', '2008-04-14', '[{"email":"o.rouvier@transports-rouvier.fr","type":"Work"}]', '[{"number":"+33 3 20 47 66 13","type":"Work"}]', null, now() - interval '2 months', now() - interval '41 days'),
    (19, 'Sandrine', 'Colin',     'female', 'Responsable exploitation',           8, 'Utilisateur',  'prospect', 'warm',        '{4}',   false, 'Terrain, connaît la réalité des tournées et des temps de conduite.', '2017-11-20', '[{"email":"s.colin@transports-rouvier.fr","type":"Work"}]', '[{"number":"+33 6 29 55 71 84","type":"Work"}]', null, now() - interval '2 months', now() - interval '18 days'),
    (20, 'Pierre',   'Lambert',   'male',   'Médecin du travail',              null, 'Prescripteur', 'partner',  'in-contract', '{3}',   true,  'Partenaire prescripteur, oriente plusieurs entreprises du bassin lillois vers nous.', null, '[{"email":"p.lambert@sante-travail-nord.fr","type":"Work"}]', '[{"number":"+33 3 20 12 47 00","type":"Work"}]', null, now() - interval '24 months', now() - interval '30 days');

-- Cross-references between contacts (a contact met through another).
update public.contacts set linked_contact_ids = '{2,3}'  where id = 1;
update public.contacts set linked_contact_ids = '{1}'     where id = 2;
update public.contacts set linked_contact_ids = '{5}'     where id = 4;
update public.contacts set linked_contact_ids = '{7,8}'   where id = 6;
update public.contacts set linked_contact_ids = '{12,13}' where id = 11;
update public.contacts set linked_contact_ids = '{11}'    where id = 12;
update public.contacts set linked_contact_ids = '{16}'    where id = 17;
update public.contacts set linked_contact_ids = '{18,19}' where id = 20;

alter table public.contacts enable trigger "20_contact_saved";

--
-- 6. Deals. `stage` comes from defaultDealStages, `confidentiality` from
--    relationshipStatuses, `origin` / `objectives` from the `choices` referential.
--
insert into public.deals (id, name, company_id, contact_ids, stage, category, index, amount, expected_closing_date, confidentiality, reference, origin, motivation, objectives, other_expectations, description, created_at, updated_at, archived_at) values
    (1,  'Diagnostic TMS chantiers', 1, '{1,2}', 'won', 'other', 0, 28000, current_date - 120, 'client', 'BAT-2024-001', 'Recommandation', 'Sinistralité TMS en hausse sur les équipes de gros œuvre, avec trois inaptitudes en dix-huit mois.', '{"Structurer une démarche","Sensibiliser"}', 'Restitution en CSE souhaitée.', 'Diagnostic ergonomique sur 4 agences pilotes, puis plan d''action co-construit avec les chefs de chantier.', now() - interval '16 months', now() - interval '4 months', null),
    (2,  'Déploiement échauffement chantier', 1, '{1,2,3}', 'in-negociation', 'other', 0, 46000, current_date + 35, 'client', 'BAT-2025-014', 'Recommandation', 'Suite du diagnostic : généraliser le protocole d''échauffement aux 12 agences.', '{"Former","Structurer une démarche"}', 'Formation de référents internes pour tenir le dispositif dans la durée.', 'Déploiement sur 12 agences, 24 sessions, formation de 18 référents.', now() - interval '5 months', now() - interval '6 days', null),
    (3,  'Plan d''action équipe de nuit', 2, '{4,5}', 'proposal-sent', 'other', 0, 19500, current_date + 21, 'client', 'CSM-2025-007', 'Site internet', 'Absentéisme de 11 % sur l''équipe de nuit, difficultés de remplacement permanentes.', '{"Réduire les RPS","Accompagner les managers"}', 'Une proposition chiffrée en coût évité de l''absentéisme.', 'Analyse des horaires et de la charge, ateliers avec les cadres de santé, plan d''action à 12 mois.', now() - interval '3 months', now() - interval '20 days', null),
    (4,  'Accord QVCT — dispositif multi-sites', 3, '{6,7,8}', 'in-negociation', 'other', 1, 132000, current_date + 60, 'client', 'NOV-2025-002', 'Partenaire', 'Accord QVCT signé : obligation de déployer un dispositif homogène sur les 24 sites du groupe.', '{"Structurer une démarche","Former","Répondre à une obligation"}', 'Reporting consolidé groupe, un référent par site.', 'Cadrage groupe, 24 diagnostics locaux, formation des référents, pilotage annuel.', now() - interval '10 months', now() - interval '2 days', null),
    (5,  'Sensibilisation posture atelier', 4, '{9,10}', 'opportunity', 'other', 0, 8400, current_date + 75, 'prospect', null, 'Prospection', 'Première démarche de prévention, sans historique ni référent interne.', '{"Sensibiliser"}', 'Format court, sans arrêt de ligne.', 'Deux demi-journées de sensibilisation posture et gestes, sur le temps de production.', now() - interval '7 months', now() - interval '16 days', null),
    (6,  'Prévention RPS plateaux téléphoniques', 5, '{11,12,13}', 'proposal-sent', 'other', 1, 64000, current_date + 45, 'prospect', 'AXE-2025-031', 'Préventica', 'Alerte du médecin du travail sur trois plateaux, forte pression sur les indicateurs de qualité de service.', '{"Réduire les RPS","Accompagner les managers","Structurer une démarche"}', 'Association des organisations syndicales dès le cadrage.', 'Diagnostic RPS sur 3 plateaux, entretiens collectifs, plan d''action et accompagnement managérial.', now() - interval '6 months', now() - interval '1 day', null),
    (7,  'Formation manageurs — charge de travail', 6, '{14,15}', 'opportunity', 'other', 1, 15600, current_date + 40, 'prospect', null, 'Linkedin', 'Effectif doublé en dix-huit mois, manageurs promus en interne sans formation.', '{"Former","Accompagner les managers"}', 'Format court, résultats mesurables.', 'Trois modules d''une journée pour 22 manageurs, sur la charge de travail et les signaux faibles.', now() - interval '4 months', now() - interval '4 days', null),
    (8,  'Mise à jour du DUERP', 7, '{16,17}', 'in-negociation', 'other', 2, 24000, current_date + 25, 'prospect', 'VSH-2025-MP12', 'Solutions CSE', 'DUERP non mis à jour depuis quatre ans, contrôle annoncé.', '{"Répondre à une obligation","Structurer une démarche"}', 'Livrable conforme et transférable aux équipes internes.', 'Mise à jour du document unique sur 6 sites, avec transfert de méthode aux agents.', now() - interval '3 months', now() - interval '7 days', null),
    (9,  'Prévention conducteurs longue distance', 8, '{18,19}', 'delayed', 'other', 0, 31000, current_date + 150, 'prospect', null, 'Préventica', 'Turnover élevé chez les conducteurs, isolement et fatigue signalés en entretien.', '{"Sensibiliser","Réduire les RPS"}', 'Budget à arbitrer au prochain exercice.', 'Dispositif itinérant sur les 9 agences, reporté à l''exercice suivant.', now() - interval '2 months', now() - interval '18 days', null),
    (10, 'Audit ergonomique sièges de bureau', 5, '{11}', 'lost', 'other', 0, 6200, current_date - 40, 'prospect', null, 'Site internet', 'Demande ponctuelle sur le mobilier, hors de notre cœur de métier.', '{"Sensibiliser"}', null, 'Perdu au profit d''un fournisseur de mobilier proposant l''audit gratuitement.', now() - interval '5 months', now() - interval '40 days', null),
    (11, 'Bilan annuel démarche TMS', 1, '{1,3}', 'won', 'other', 1, 9800, current_date - 25, 'client', 'BAT-2025-022', 'Recommandation', 'Point annuel contractuel sur les indicateurs du plan d''action.', '{"Structurer une démarche"}', null, 'Bilan chiffré, restitution en CSE et cadrage des priorités de l''année suivante.', now() - interval '13 months', now() - interval '25 days', now() - interval '20 days');

--
-- 7. Notes.
--
insert into public.contact_notes (contact_id, text, date, status) values
    (1,  'Point téléphonique : valide le principe du déploiement sur les 12 agences, attend le chiffrage détaillé par agence avant de passer en comité.', now() - interval '6 days', 'in-contract'),
    (2,  'Visite du chantier de Villeurbanne. Les compagnons sont demandeurs, l''échauffement est déjà pratiqué de façon informelle par deux équipes.', now() - interval '12 days', 'hot'),
    (3,  'Insiste pour que les résultats du diagnostic soient présentés en CSE avant toute communication générale.', now() - interval '25 days', 'warm'),
    (4,  'Confirme un budget disponible sur l''exercice en cours. Veut voir le coût évité de l''absentéisme dans la proposition.', now() - interval '20 days', 'warm'),
    (5,  'Trois arrêts de travail simultanés sur l''équipe de nuit ce mois-ci. Demande une intervention rapide.', now() - interval '3 days', 'hot'),
    (6,  'Comité de pilotage groupe : calendrier de déploiement validé, démarrage sur 4 sites pilotes.', now() - interval '2 days', 'in-contract'),
    (7,  'A transmis la liste des 24 sites avec les contacts locaux et les effectifs.', now() - interval '5 days', 'hot'),
    (9,  'Reste sur une logique de test. Veut commencer par un seul atelier avant d''engager la suite.', now() - interval '16 days', 'warm'),
    (11, 'Rencontrée sur le stand Préventica. Repart avec la plaquette, demande une proposition sous quinze jours.', now() - interval '1 day', 'hot'),
    (13, 'Position prudente en commission : veut la garantie de l''anonymat des entretiens collectifs.', now() - interval '52 days', 'cold'),
    (14, 'Demande un format compressé : pas plus d''une journée par module, sinon les équipes ne suivront pas.', now() - interval '4 days', 'hot'),
    (17, 'Prépare le cahier des charges. Nous transmet la trame du marché public pour vérification.', now() - interval '7 days', 'hot'),
    (18, 'Rappelle que le budget prévention est gelé jusqu''au prochain exercice. À recontacter en janvier.', now() - interval '41 days', 'cold'),
    (20, 'Nous oriente vers deux entreprises du bassin lillois, dont Transports Rouvier.', now() - interval '30 days', 'in-contract');

insert into public.deal_notes (deal_id, text, date) values
    (1,  'Mission clôturée. Baisse de 22 % des jours d''arrêt liés aux TMS sur les 4 agences pilotes.', now() - interval '4 months'),
    (2,  'Négociation sur le nombre de référents à former : 18 demandés contre 24 proposés. Impact sur le prix à arbitrer.', now() - interval '6 days'),
    (3,  'Proposition envoyée le 12. Relance prévue sous dix jours si pas de retour.', now() - interval '20 days'),
    (4,  'Achats demande un découpage en trois lots. Revoir la structure de la proposition.', now() - interval '2 days'),
    (6,  'Proposition envoyée avec une option ateliers managers. Retour attendu après la commission CSSCT.', now() - interval '1 day'),
    (7,  'Attend notre retour sur la possibilité de tenir les modules en distanciel pour l''équipe de Lisbonne.', now() - interval '4 days'),
    (8,  'Réponse au marché à déposer avant le 30. Pièce administrative manquante : attestation de vigilance.', now() - interval '7 days'),
    (9,  'Reporté à l''exercice suivant, le budget prévention est gelé. Dossier à garder au chaud.', now() - interval '18 days'),
    (10, 'Perdu. Le fournisseur de mobilier incluait l''audit dans son offre, impossible de s''aligner.', now() - interval '40 days');

--
-- 8. Meetings (tasks). `type` and `mode` use the `choices` labels
--    (rdv_type / rdv_mode); `location` stays empty for the remote modes.
--
insert into public.tasks (contact_id, type, mode, location, text, due_date, done_date) values
    (1,  'Rendez-vous de suivi',            'Présentiel',      'Siège Batilor, Lyon 7e',     'Présenter le chiffrage détaillé par agence pour le déploiement.', now() + interval '3 days', null),
    (2,  'Rendez-vous de suivi',            'Présentiel',      'Chantier Villeurbanne',      'Observer une séance d''échauffement menée par l''équipe.', now() + interval '8 days', null),
    (5,  'Rendez-vous découverte',          'Visioconférence', null,                         'Analyser les plannings de nuit sur les trois derniers mois.', now() + interval '2 days', null),
    (4,  'Préparation d''une proposition',  'Téléphone',       null,                         'Valider le périmètre avant envoi de la proposition définitive.', now() - interval '5 days', now() - interval '5 days'),
    (6,  'Lancement de mission',            'Présentiel',      'Novaterre, quai Malakoff',   'Comité de lancement avec les référents des 4 sites pilotes.', now() + interval '12 days', null),
    (7,  'Rendez-vous de suivi',            'Visioconférence', null,                         'Caler le planning des diagnostics site par site.', now() + interval '6 days', null),
    (8,  'Premier contact',                 'Téléphone',       null,                         'Comprendre les contraintes achats et le découpage en lots.', now() + interval '4 days', null),
    (9,  'Rendez-vous découverte',          'Présentiel',      'Maison Delorme, Reims',      'Visiter l''atelier et cadrer le format de la sensibilisation.', now() + interval '15 days', null),
    (11, 'Préparation d''une proposition',  'Visioconférence', null,                         'Présenter la proposition RPS avant passage en commission.', now() + interval '5 days', null),
    (12, 'Premier contact',                 'Téléphone',       null,                         'Associer les organisations syndicales au cadrage.', now() + interval '9 days', null),
    (14, 'Rendez-vous découverte',          'Visioconférence', null,                         'Recadrer le format des modules manageurs sur une journée.', now() + interval '7 days', null),
    (17, 'Rendez-vous de suivi',            'Présentiel',      'Mairie de Sainte-Hélène',    'Relire ensemble le cahier des charges du marché.', now() + interval '2 days', null),
    (16, 'Bilan annuel',                    'Présentiel',      'Mairie de Sainte-Hélène',    'Point d''avancement sur la mise à jour du DUERP.', now() + interval '30 days', null),
    (18, 'Premier contact',                 'Salon',           'Salon Préventica, Lille',    'Reprendre contact sur le stand, budget à rouvrir.', now() + interval '45 days', null),
    (19, 'Rendez-vous découverte',          'Présentiel',      'Agence de Marcq-en-Barœul',  'Suivre une tournée pour objectiver les temps de conduite.', now() + interval '18 days', null),
    (3,  'Restitution',                     'Présentiel',      'Siège Batilor, Lyon 7e',     'Restituer les résultats du diagnostic en CSE.', now() - interval '30 days', now() - interval '30 days'),
    (20, 'Rendez-vous de suivi',            'Téléphone',       null,                         'Remercier pour les recommandations et faire un point trimestriel.', now() - interval '10 days', now() - interval '10 days');

--
-- 9. Ownership — the insert triggers read auth.uid(), which is null outside a
--    request, so assign everything to the first sales account here.
--
do $$
declare
    owner_id bigint;
begin
    select id into owner_id from public.sales order by id limit 1;

    update public.companies     set sales_id = owner_id where sales_id is null;
    update public.contacts      set sales_id = owner_id where sales_id is null;
    update public.contact_notes set sales_id = owner_id where sales_id is null;
    update public.deals         set sales_id = owner_id where sales_id is null;
    update public.deal_notes    set sales_id = owner_id where sales_id is null;
    update public.tasks         set sales_id = owner_id where sales_id is null;
end
$$;

--
-- 10. Realign the identity sequences after the explicit ids above.
--
do $$
declare
    tbl text;
begin
    foreach tbl in array array['tags', 'companies', 'contacts', 'deals', 'contact_notes', 'deal_notes', 'tasks']
    loop
        execute format(
            'select setval(pg_get_serial_sequence(%L, %L), coalesce((select max(id) from public.%I), 1))',
            'public.' || tbl, 'id', tbl
        );
    end loop;
end
$$;

commit;
