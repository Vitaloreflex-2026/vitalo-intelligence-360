--
-- Staging volume seed — a large batch of fake CRM data.
--
-- Paste this file into the SQL editor of the STAGING Supabase project and run
-- it. Everything runs in one transaction: on error, nothing is kept.
--
-- It only ADDS rows to tags, companies, contacts, deals, contact_notes,
-- deal_notes, tasks and assessments. It never deletes anything and never
-- touches a row it did not create.
--
-- Safety:
--   - It refuses to run when the database already holds companies, so pasting
--     it into the production project by mistake changes nothing. To add another
--     batch on top of existing staging data, set `allow_existing_data` below.
--   - It never creates a user. Sign up in the app first: every generated row is
--     assigned to one of the existing accounts.
--   - Emails and websites use the reserved `.example` domain, which can never
--     reach a real person or company.
--
-- `supabase/seed-demo.sql` is the small hand-written dataset used for local
-- development; this one trades consistency for volume.
--

begin;

--
-- Settings. Every other volume scales from the number of companies (at most
-- 640: the number of distinct names the lists below can build).
--
create temp table seed_settings on commit drop as
select
    150 as nb_companies,
    false as allow_existing_data;

do $$
begin
    if not exists (select 1 from public.sales where not disabled) then
        raise exception 'No user account found. Sign up in the staging app first, then run this script again.';
    end if;

    if exists (select 1 from public.companies)
        and not (select allow_existing_data from seed_settings) then
        raise exception 'This database already holds companies: nothing was changed. This script only fills an empty database, so that it can never pollute production. On staging, set allow_existing_data to true to add a batch anyway.';
    end if;
end
$$;

--
-- Helpers, dropped with the session. `r` is always a random() in [0, 1) drawn
-- once per generated row, so that related columns can share the same draw.
--
create or replace function pg_temp.pick(items anyarray, r double precision) returns anyelement
    language sql immutable
    as $$ select items[1 + floor(r * array_length(items, 1))::int] $$;

create or replace function pg_temp.slice(items anyarray, r double precision, len int) returns anyarray
    language sql immutable
    as $$
        select items[1 + floor(r * array_length(items, 1))::int : floor(r * array_length(items, 1))::int + len]
    $$;

create or replace function pg_temp.slug(label text) returns text
    language sql immutable
    as $$
        select trim(both '-' from regexp_replace(
            lower(translate(label, 'àâäçéèêëîïôöùûüÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ', 'aaaceeeeiioouuuaaaceeeeiioouuu')),
            '[^a-z0-9]+', '-', 'g'
        ))
    $$;

create or replace function pg_temp.phone(prefix text, r double precision) returns text
    language sql immutable
    as $$
        select prefix || ' ' || regexp_replace(
            lpad(floor(r * 100000000)::bigint::text, 8, '0'), '(..)(..)(..)(..)', '\1 \2 \3 \4'
        )
    $$;

--
-- 1. Tags.
--
insert into public.tags (name, color)
select v.name, v.color
from (
    values
        ('CSE', '#eddcd2'),
        ('grand-compte', '#fff1e6'),
        ('prescripteur', '#fde2e4'),
        ('salon', '#fad2e1'),
        ('multi-sites', '#c5dedd'),
        ('à-relancer', '#dbe7e4')
) as v (name, color)
where not exists (select 1 from public.tags t where t.name = v.name);

--
-- 2. Word lists and referentials the generators draw from. The `choices`
--    columns hold the labels of the app referential, since records store labels.
--
create temp table seed_lists on commit drop as
select
    (select array_agg(id order by id) from public.sales where not disabled) as sales_ids,
    (select array_agg(id order by id) from public.tags) as tag_ids,
    (select array_agg(label order by label) from public.choices where category = 'deal_origin') as origins,
    (select array_agg(label order by label) from public.choices where category = 'deal_objective') as objectives,
    (select array_agg(label order by label) from public.choices where category = 'rdv_type') as rdv_types,
    (select array_agg(label order by label) from public.choices where category = 'rdv_mode') as rdv_modes,
    array[
        'Camille', 'Hélène', 'Sophie', 'Laure', 'Nadia', 'Claire', 'Isabelle', 'Amélie', 'Emma', 'Fatima',
        'Sandrine', 'Julie', 'Marion', 'Céline', 'Aurélie', 'Léa', 'Manon', 'Inès', 'Chloé', 'Pauline',
        'Anaïs', 'Élodie', 'Nathalie', 'Valérie', 'Karine', 'Myriam', 'Agnès', 'Delphine', 'Stéphanie', 'Margaux'
    ] as first_names_f,
    array[
        'Marc', 'Bruno', 'Thierry', 'Philippe', 'Julien', 'Franck', 'Yanis', 'Gérard', 'Olivier', 'Pierre',
        'Nicolas', 'Antoine', 'Mathieu', 'Sébastien', 'Laurent', 'Karim', 'Hugo', 'Lucas', 'Romain', 'Vincent',
        'Maxime', 'Benoît', 'Christophe', 'Damien', 'Fabrice', 'Guillaume', 'Mehdi', 'Pascal', 'Rémi', 'Xavier'
    ] as first_names_m,
    array[
        'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
        'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
        'Morel', 'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez',
        'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guérin', 'Muller', 'Henry', 'Roussel', 'Nicolas',
        'Perrin', 'Morin', 'Mathieu', 'Clément', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin',
        'Benali', 'Nguyen', 'Diallo', 'Haddad', 'Costa'
    ] as last_names,
    -- The four arrays below are index-aligned: one job per position.
    array[
        'Directeur général', 'Directeur des ressources humaines', 'Responsable QHSE', 'Secrétaire du CSE',
        'Responsable formation', 'Acheteur', 'Chargé de prévention', 'Responsable QVCT',
        'Élu CSSCT', 'Responsable de site', 'Médecin du travail', 'Directeur des opérations'
    ] as titles_m,
    array[
        'Directrice générale', 'Directrice des ressources humaines', 'Responsable QHSE', 'Secrétaire du CSE',
        'Responsable formation', 'Acheteuse', 'Chargée de prévention', 'Responsable QVCT',
        'Élue CSSCT', 'Responsable de site', 'Médecin du travail', 'Directrice des opérations'
    ] as titles_f,
    array[
        'Décideur', 'Décideur', 'Prescripteur', 'Influenceur',
        'Utilisateur', 'Acheteur', 'Prescripteur', 'Décideur',
        'Influenceur', 'Utilisateur', 'Prescripteur', 'Décideur'
    ] as decision_roles,
    array[
        null, 'hr', 'hse', 'cse',
        'hr', null, 'hse', 'hr',
        'cse', null, null, null
    ]::text[] as sponsor_roles,
    -- 'City|zipcode'
    array[
        'Paris|75009', 'Lyon|69003', 'Marseille|13008', 'Toulouse|31000', 'Nantes|44000', 'Bordeaux|33000',
        'Lille|59000', 'Strasbourg|67000', 'Rennes|35000', 'Grenoble|38000', 'Montpellier|34000', 'Nice|06000',
        'Reims|51100', 'Dijon|21000', 'Angers|49000', 'Clermont-Ferrand|63000', 'Tours|37000', 'Rouen|76000',
        'Orléans|45000', 'Metz|57000'
    ] as cities,
    array[
        'rue de la République', 'avenue Jean Jaurès', 'boulevard Voltaire', 'rue Victor Hugo',
        'place de la Mairie', 'rue des Lilas', 'avenue du Général de Gaulle', 'quai de la Loire',
        'rue Pasteur', 'chemin des Vignes', 'allée des Tilleuls', 'rue de l''Industrie'
    ] as streets,
    array[
        'Forte sinistralité TMS sur les équipes terrain, démarche de prévention à structurer.',
        'Absentéisme en hausse depuis deux ans, la direction cherche un plan d''action chiffré.',
        'Accord QVCT signé, déploiement à organiser sur l''ensemble des sites.',
        'Première démarche de prévention, pilotée directement par la direction.',
        'Plateaux téléphoniques identifiés à risque RPS par la médecine du travail.',
        'Croissance rapide, managers promus en interne sans formation.',
        'DUERP à mettre à jour avant la fin de l''exercice.',
        'Turnover élevé et difficultés de recrutement sur les métiers en tension.'
    ] as company_descriptions,
    array[
        'Porte le sujet prévention en interne. Attend des indicateurs chiffrés avant d''engager le budget.',
        'Relais opérationnel sur le terrain, connaît très bien les équipes.',
        'Suit de près la restitution collective des résultats aux salariés.',
        'Arbitre les dépenses au-delà de 20 k€. Sensible au coût de l''absentéisme.',
        'Contact pris sur un salon. À recontacter après la clôture budgétaire.',
        'Organise la logistique des sessions et les inscriptions.',
        'Passage obligé pour tout marché au-delà de 50 k€. Très process.',
        'Demande un format court, compatible avec les contraintes de production.'
    ] as contact_backgrounds,
    -- 'Name|description'
    array[
        'Diagnostic RPS|Entretiens collectifs et individuels, analyse des indicateurs RH et restitution en CSE.',
        'Sensibilisation PSMT|Sessions de deux heures pour l''ensemble des salariés, sur site.',
        'Formation managers PSMM|Trois modules d''une journée sur les signaux faibles et la charge de travail.',
        'Déploiement IMPACT 360|Cadrage, diagnostics par site, formation des référents et pilotage annuel.',
        'Baromètre QVCT annuel|Questionnaire, analyse comparée d''une année sur l''autre et plan d''action.',
        'Prévention des TMS|Diagnostic ergonomique des postes et protocole d''échauffement.',
        'Mise à jour du DUERP|Mise à jour du document unique avec transfert de méthode aux équipes internes.',
        'Formation PSSM|Formation de secouristes en santé mentale, deux jours par groupe.',
        'Conférence santé mentale|Conférence d''ouverture de la semaine de la QVCT, en présentiel et en visio.',
        'Ateliers gestion du stress|Cycle de quatre ateliers en petits groupes.',
        'Accompagnement réorganisation|Appui aux managers pendant la réorganisation, ateliers et points d''étape.',
        'Club managers|Séances trimestrielles de codéveloppement pour les managers de proximité.'
    ] as deal_offers,
    array[
        'Absentéisme en hausse sur les équipes terrain, difficultés de remplacement permanentes.',
        'Alerte du médecin du travail, forte pression sur les indicateurs de qualité de service.',
        'Accord QVCT signé : obligation de déployer un dispositif homogène sur tous les sites.',
        'Effectif doublé en dix-huit mois, managers promus en interne sans formation.',
        'DUERP non mis à jour depuis plusieurs années, contrôle annoncé.',
        'Turnover élevé, isolement et fatigue signalés en entretien.',
        'Première démarche de prévention, sans historique ni référent interne.',
        'Demande du CSE après plusieurs arrêts longs dans le même service.'
    ] as deal_motivations,
    array[
        'Restitution en CSE souhaitée.',
        'Format court, sans arrêt de production.',
        'Reporting consolidé, un référent par site.',
        'Formation de référents internes pour tenir le dispositif dans la durée.',
        'Une proposition chiffrée en coût évité de l''absentéisme.',
        'Association des organisations syndicales dès le cadrage.'
    ] as deal_expectations,
    array[
        'Point téléphonique : valide le principe, attend le chiffrage détaillé avant de passer en comité.',
        'Visite du site. Les équipes sont demandeuses, une pratique informelle existe déjà.',
        'Insiste pour que les résultats soient présentés en CSE avant toute communication générale.',
        'Confirme un budget disponible sur l''exercice en cours.',
        'Plusieurs arrêts de travail simultanés ce mois-ci. Demande une intervention rapide.',
        'Comité de pilotage : calendrier de déploiement validé, démarrage sur des sites pilotes.',
        'A transmis la liste des sites avec les contacts locaux et les effectifs.',
        'Reste sur une logique de test : un seul atelier avant d''engager la suite.',
        'Échange sur le stand, repart avec la plaquette et demande une proposition sous quinze jours.',
        'Position prudente : demande la garantie de l''anonymat des entretiens collectifs.',
        'Demande un format compressé, pas plus d''une journée par module.',
        'Budget prévention gelé jusqu''au prochain exercice. À recontacter en janvier.'
    ] as contact_notes,
    array[
        'Proposition envoyée. Relance prévue sous dix jours sans retour.',
        'Négociation sur le nombre de référents à former, impact sur le prix à arbitrer.',
        'Les achats demandent un découpage en trois lots. Revoir la structure de la proposition.',
        'Retour attendu après la prochaine commission CSSCT.',
        'Demande la possibilité de tenir les modules en distanciel pour un site éloigné.',
        'Pièce administrative manquante : attestation de vigilance.',
        'Reporté à l''exercice suivant, dossier à garder au chaud.',
        'Mission clôturée, baisse mesurée des arrêts courts sur les sites pilotes.',
        'Convention signée, première session planifiée.',
        'Perdu : un concurrent incluait la prestation dans une offre plus large.'
    ] as deal_notes,
    array[
        'Présenter le chiffrage détaillé de la proposition.',
        'Observer une séance sur site avec les équipes.',
        'Analyser les indicateurs RH des trois derniers mois.',
        'Valider le périmètre avant envoi de la proposition définitive.',
        'Comité de lancement avec les référents des sites pilotes.',
        'Caler le planning des interventions site par site.',
        'Comprendre les contraintes achats et le découpage en lots.',
        'Restituer les résultats du diagnostic.',
        'Faire un point d''avancement trimestriel.',
        'Reprendre contact et rouvrir le sujet du budget.'
    ] as task_texts,
    array[
        'Actions menées site par site, sans pilotage central ni suivi dans le temps.',
        'Cellule d''écoute externalisée, peu sollicitée par les équipes.',
        'Baromètre social annuel, résultats dégradés sur certains services.',
        'Journées sécurité annuelles, volet santé mentale absent du DUERP.',
        'Aucun dispositif à ce jour.',
        'Sensibilisation déployée sur des sites pilotes, formation des managers engagée.'
    ] as program_comments,
    array[
        'Les arrêts courts se multiplient depuis deux ans.',
        'Absentéisme nettement supérieur sur les équipes de nuit.',
        'Réorganisation en cours, charge mentale signalée par les équipes.',
        'Turnover élevé et tensions relationnelles dans plusieurs services.',
        'Managers promus sans formation, aucun relais RH sur site.',
        'Agents d''accueil et services techniques particulièrement exposés.'
    ] as issue_comments,
    array[
        'Réduire l''absentéisme', 'Outiller les managers de proximité', 'Structurer un suivi chiffré',
        'Former un réseau de référents', 'Intégrer les RPS au DUERP', 'Sensibiliser l''ensemble des salariés',
        'Mesurer avant et après', 'Poser un premier cadre de prévention'
    ] as client_priorities,
    -- One comment per profile level, from 1 to 3.
    array[
        'Point de départ : aucun dispositif ni gouvernance, mais une direction demandeuse.',
        'Des actions réelles mais dispersées, sans gouvernance ni mesure.',
        'Démarche installée et outillée. La mesure reste le point faible.'
    ] as profile_comments;

--
-- 3. Companies. Names combine a kind and an invented root, so they are unique.
--    `company_saved` derives the logo from the website domain.
--
create temp table seed_companies (
    id bigint primary key,
    code text,
    domain text,
    city text,
    relationship text,
    sales_id bigint,
    created_at timestamp with time zone
) on commit drop;

with kinds (pattern, sector) as (
    values
        ('Groupe %s', 'Industrie'),
        ('%s Industries', 'Industrie'),
        ('Transports %s', 'Industrie'),
        ('Ateliers %s', 'Industrie'),
        ('Clinique %s', 'Santé'),
        ('Laboratoires %s', 'Santé'),
        ('%s Énergies', 'Énergie'),
        ('%s Assurances', 'Finance'),
        ('Mutuelle %s', 'Finance'),
        ('Maison %s', 'Consommation de base'),
        ('%s Distribution', 'Consommation discrétionnaire'),
        ('%s Digital', 'Technologies de l''information'),
        ('%s Télécom', 'Services de communication'),
        ('%s Matériaux', 'Matériaux'),
        ('%s Habitat', 'Immobilier'),
        ('Régie %s', 'Services aux collectivités')
),
roots (root) as (
    values
        ('Valtéris'), ('Norélia'), ('Bréval'), ('Solanne'), ('Kerduel'), ('Altivia'), ('Mérinor'), ('Cassiade'),
        ('Orvalis'), ('Lubéris'), ('Tarnelle'), ('Savoret'), ('Dornelle'), ('Vendémia'), ('Aubrelle'), ('Corvénia'),
        ('Estivel'), ('Faréol'), ('Galdane'), ('Hélivia'), ('Iroise'), ('Jolimont'), ('Landéric'), ('Mauréal'),
        ('Nérac'), ('Ombeline'), ('Portalis'), ('Quercy'), ('Rivéal'), ('Sévrac'), ('Tolmé'), ('Ussel'),
        ('Vaubrun'), ('Wissant'), ('Ylona'), ('Zéphir'), ('Armance'), ('Bélisaire'), ('Clairval'), ('Dufrêne')
),
picked as materialized (
    select
        format(x.pattern, x.root) as name,
        x.root,
        x.sector,
        random() as r_size, random() as r_sites, random() as r_city, random() as r_street,
        random() as r_number, random() as r_phone, random() as r_linkedin, random() as r_revenue,
        random() as r_siren, random() as r_text, random() as r_age, random() as r_owner,
        random() as r_relationship
    from (
        -- The random order must stay in its own subquery: next to an
        -- `order by random()`, Postgres makes every random() column above
        -- equal to the sort key.
        select k.pattern, k.sector, r.root
        from kinds k
        cross join roots r
        order by random()
        limit (select nb_companies from seed_settings)
    ) x
),
shaped as (
    select
        p.*,
        pg_temp.slug(p.name) as slug,
        pg_temp.pick(array[50, 100, 250, 500, 1000], p.r_size) as size,
        pg_temp.pick(l.cities, p.r_city) as city_zip
    from picked p
    cross join seed_lists l
),
inserted as (
    insert into public.companies (
        name, sector, size, nb_sites, website, linkedin_url, phone_number, address, zipcode, city, country,
        revenue, tax_identifier, description, created_at, sales_id
    )
    select
        s.name,
        s.sector,
        s.size,
        greatest(1, floor(s.r_sites * s.size / 40))::int,
        s.slug || '.example',
        case when s.r_linkedin < 0.6 then 'https://www.linkedin.com/company/' || s.slug end,
        pg_temp.phone('+33 ' || (1 + floor(s.r_number * 5))::int, s.r_phone),
        (1 + floor(s.r_number * 140))::int || ' ' || pg_temp.pick(l.streets, s.r_street),
        split_part(s.city_zip, '|', 2),
        split_part(s.city_zip, '|', 1),
        'France',
        greatest(1, round(s.size * (0.05 + s.r_revenue * 0.4)))::int || 'M',
        lpad(floor(s.r_siren * 1000000000)::bigint::text, 9, '0'),
        pg_temp.pick(l.company_descriptions, s.r_text),
        now() - make_interval(days => 20 + floor(s.r_age * 700)::int),
        pg_temp.pick(l.sales_ids, s.r_owner)
    from shaped s
    cross join seed_lists l
    returning id, name, website, city, sales_id, created_at
)
insert into seed_companies (id, code, domain, city, relationship, sales_id, created_at)
select
    i.id,
    upper(left(pg_temp.slug(s.root), 3)),
    i.website::text,
    i.city,
    case
        when s.r_relationship < 0.35 then 'client'
        when s.r_relationship < 0.95 then 'prospect'
        else 'partner'
    end,
    i.sales_id,
    i.created_at
from inserted i
join shaped s on s.name = i.name;

--
-- 4. Contacts, two to six per company. The gravatar lookup trigger fires one
--    HTTP call per inserted or updated row, which makes a bulk seed very slow:
--    switch it off until the notes are in (each note updates its contact).
--
create temp table seed_contacts (
    id bigint primary key,
    company_id bigint,
    sales_id bigint,
    status text,
    first_seen timestamp with time zone
) on commit drop;

alter table public.contacts disable trigger "20_contact_saved";

with slots as materialized (
    select
        c.id as company_id, c.domain, c.relationship, c.sales_id, c.created_at,
        random() as r_gender, random() as r_first, random() as r_last, random() as r_title,
        random() as r_status, random() as r_newsletter, random() as r_background, random() as r_start,
        random() as r_seen, random() as r_last_seen, random() as r_phone, random() as r_linkedin,
        random() as r_tag, random() as r_tag_pick
    from (
        select sc.*, 2 + floor(random() * 5)::int as nb_contacts
        from seed_companies sc
    ) c
    cross join lateral generate_series(1, c.nb_contacts)
),
people as (
    select
        s.*,
        case when s.r_gender < 0.5 then 'female' else 'male' end as gender,
        case
            when s.r_gender < 0.5 then pg_temp.pick(l.first_names_f, s.r_first)
            else pg_temp.pick(l.first_names_m, s.r_first)
        end as first_name,
        pg_temp.pick(l.last_names, s.r_last) as last_name,
        1 + floor(s.r_title * array_length(l.titles_m, 1))::int as job,
        s.created_at + s.r_seen * (now() - s.created_at) as first_seen
    from slots s
    cross join seed_lists l
),
inserted as (
    insert into public.contacts (
        first_name, last_name, gender, title, company_id, decision_role, relationship_status, status, tags,
        has_newsletter, background, company_start_date, email_jsonb, phone_jsonb, linkedin_url,
        first_seen, last_seen, sales_id, sponsor_role
    )
    select
        p.first_name,
        p.last_name,
        p.gender,
        case when p.gender = 'female' then l.titles_f[p.job] else l.titles_m[p.job] end,
        p.company_id,
        l.decision_roles[p.job],
        p.relationship,
        case
            when p.relationship = 'prospect'
                then pg_temp.pick(array['cold', 'cold', 'warm', 'warm', 'warm', 'hot'], p.r_status)
            else pg_temp.pick(array['in-contract', 'in-contract', 'hot', 'warm'], p.r_status)
        end,
        case when p.r_tag < 0.45 then array[pg_temp.pick(l.tag_ids, p.r_tag_pick)] else '{}'::bigint[] end,
        p.r_newsletter < 0.4,
        pg_temp.pick(l.contact_backgrounds, p.r_background),
        current_date - (200 + floor(p.r_start * 6000))::int,
        jsonb_build_array(jsonb_build_object(
            'email', pg_temp.slug(p.first_name) || '.' || pg_temp.slug(p.last_name) || '@' || p.domain,
            'type', 'Work'
        )),
        jsonb_build_array(jsonb_build_object('number', pg_temp.phone('+33 6', p.r_phone), 'type', 'Work')),
        case
            when p.r_linkedin < 0.3
                then 'https://www.linkedin.com/in/' || pg_temp.slug(p.first_name) || '-' || pg_temp.slug(p.last_name)
        end,
        p.first_seen,
        p.first_seen + p.r_last_seen * (now() - p.first_seen),
        p.sales_id,
        l.sponsor_roles[p.job]
    from people p
    cross join seed_lists l
    returning id, company_id, sales_id, status, first_seen
)
insert into seed_contacts (id, company_id, sales_id, status, first_seen)
select id, company_id, sales_id, status, first_seen
from inserted;

--
-- 5. Deals. A client has one to four of them and at least one won contract, a
--    prospect up to two, a partner none. `stage` comes from defaultDealStages,
--    `confidentiality` from relationshipStatuses.
--
create temp table seed_deals (
    id bigint primary key,
    stage text,
    amount bigint,
    sales_id bigint,
    created_at timestamp with time zone,
    closing_date date
) on commit drop;

with slots as materialized (
    select
        c.id as company_id, c.code, c.relationship, c.sales_id, c.created_at as company_created_at, n,
        random() as r_stage, random() as r_offer, random() as r_amount, random() as r_age,
        random() as r_updated, random() as r_date, random() as r_reference, random() as r_origin,
        random() as r_objectives, random() as r_nb_objectives, random() as r_motivation,
        random() as r_expectation, random() as r_contacts, random() as r_index
    from (
        select
            sc.*,
            case sc.relationship
                when 'client' then 1 + floor(random() * 4)::int
                when 'prospect' then floor(random() * 3)::int
                else 0
            end as nb_deals
        from seed_companies sc
    ) c
    cross join lateral generate_series(1, c.nb_deals) as n
),
staged as (
    select
        s.*,
        case
            when s.relationship = 'client' and s.n = 1 then 'won'
            when s.relationship = 'client' then pg_temp.pick(
                array['won', 'won', 'in-negociation', 'proposal-sent', 'opportunity', 'delayed'], s.r_stage
            )
            else pg_temp.pick(
                array['opportunity', 'opportunity', 'proposal-sent', 'in-negociation', 'lost', 'delayed'], s.r_stage
            )
        end as stage,
        s.company_created_at + s.r_age * (now() - s.company_created_at) as created_at
    from slots s
),
inserted as (
    insert into public.deals (
        name, company_id, contact_ids, stage, category, index, amount, expected_closing_date,
        confidentiality, reference, origin, motivation, objectives, other_expectations, description,
        created_at, updated_at, sales_id
    )
    select
        split_part(pg_temp.pick(l.deal_offers, d.r_offer), '|', 1),
        d.company_id,
        array(
            select sc.id
            from seed_contacts sc
            where sc.company_id = d.company_id
            order by random()
            limit 1 + floor(d.r_contacts * 3)::int
        ),
        d.stage,
        'other',
        -- Position in the Kanban column, after the deals already in that stage.
        (
            row_number() over (partition by d.stage order by d.r_index) - 1
            + coalesce((select max(e.index) + 1 from public.deals e where e.stage = d.stage), 0)
        )::smallint,
        (round((3000 + d.r_amount * d.r_amount * 117000) / 100) * 100)::bigint,
        case
            when d.stage in ('won', 'lost') then (d.created_at + d.r_date * (now() - d.created_at))::date
            when d.stage = 'delayed' then current_date + 120 + floor(d.r_date * 180)::int
            else current_date + 7 + floor(d.r_date * 150)::int
        end,
        d.relationship,
        case
            when d.r_reference < 0.6 then
                d.code || '-' || to_char(d.created_at, 'YYYY') || '-'
                || lpad((1 + floor(d.r_reference * 1500))::int::text, 3, '0')
        end,
        pg_temp.pick(l.origins, d.r_origin),
        pg_temp.pick(l.deal_motivations, d.r_motivation),
        pg_temp.slice(l.objectives, d.r_objectives, 1 + floor(d.r_nb_objectives * 3)::int),
        case when d.r_expectation < 0.7 then pg_temp.pick(l.deal_expectations, d.r_expectation / 0.7) end,
        split_part(pg_temp.pick(l.deal_offers, d.r_offer), '|', 2),
        d.created_at,
        d.created_at + d.r_updated * (now() - d.created_at),
        d.sales_id
    from staged d
    cross join seed_lists l
    returning id, stage, amount, sales_id, created_at, expected_closing_date
)
insert into seed_deals (id, stage, amount, sales_id, created_at, closing_date)
select id, stage, amount, sales_id, created_at, expected_closing_date
from inserted;

--
-- 5b. Delivery, funding and invoicing of the won contracts — the columns the
--     yearly BPF and the dashboard alerts are built from. Some are left with
--     paperwork owed on purpose (portal data not sent, OPCO file not submitted).
--
update public.deals d
set
    trainer_ids = array[s.sales_id],
    training_type = pg_temp.pick(array['training', 'training', 'workshop', 'conference'], s.r_type),
    nb_trained_managers = floor(s.r_managers * 12)::int,
    nb_trained_non_managers = floor(s.r_staff * 60)::int,
    hours_delivered = pg_temp.pick(array[3.5, 7, 14, 21, 35], s.r_hours),
    qvct_workshop_type = pg_temp.pick(array['webinar', 'collective_onsite', 'individual'], s.r_workshop),
    passport_eligible = s.r_passport < 0.3,
    portal_data_sent = s.r_portal < 0.7,
    portal_data_sent_at = case when s.r_portal < 0.7 then least(current_date, s.closing_date + 10) end,
    qualiopi = s.r_qualiopi < 0.8,
    -- The first two entries are 'opco', so `r_funding < 0.4` means OPCO funding.
    funding_type = pg_temp.pick(array['opco', 'opco', 'hr_hse', 'cse', 'other'], s.r_funding),
    quote_signed = true,
    quote_signed_at = greatest(s.created_at::date, s.closing_date - 20),
    agreement_signed = true,
    agreement_signed_at = greatest(s.created_at::date, s.closing_date - 15),
    amount_invoiced_incl_tax = round(s.amount * 1.2),
    cost_training = round(s.amount * 0.55),
    cost_teaching = round(s.amount * 0.2),
    cost_subcontracting = case when s.r_invoiced < 0.5 then round(s.amount * 0.1) else 0 end,
    cost_travel = round(s.amount * 0.04),
    cost_materials = round(s.amount * 0.01),
    opco_name = case when s.r_funding < 0.4 then s.opco_name end,
    opco_contact_name = case when s.r_funding < 0.4 then s.opco_contact end,
    opco_contact_phone = case when s.r_funding < 0.4 then pg_temp.phone('+33 1', s.r_opco_phone) end,
    opco_contact_email = case
        when s.r_funding < 0.4
            then pg_temp.slug(s.opco_contact) || '@' || pg_temp.slug(s.opco_name) || '.example'
    end,
    opco_file_submitted = case when s.r_funding < 0.4 then s.r_opco_file < 0.7 end,
    opco_file_submitted_at = case
        when s.r_funding < 0.4 and s.r_opco_file < 0.7 then least(current_date, s.closing_date + 20)
    end,
    appropriation_rate = 60 + floor(s.r_appropriation * 39),
    satisfaction_rate = 75 + floor(s.r_satisfaction * 25)
from (
    select
        r.*,
        pg_temp.pick(array['Constructys', 'OPCO 2i', 'Akto', 'Atlas', 'OPCO Santé', 'Opcommerce'], r.r_opco) as opco_name,
        pg_temp.pick(l.first_names_f, r.r_opco_first) || ' ' || pg_temp.pick(l.last_names, r.r_opco_last) as opco_contact
    from (
        select
            sd.*,
            random() as r_type, random() as r_managers, random() as r_staff, random() as r_hours,
            random() as r_workshop, random() as r_passport, random() as r_portal, random() as r_qualiopi,
            random() as r_funding, random() as r_invoiced, random() as r_opco, random() as r_opco_first,
            random() as r_opco_last, random() as r_opco_phone, random() as r_opco_file,
            random() as r_appropriation, random() as r_satisfaction
        from seed_deals sd
        where sd.stage = 'won'
    ) r
    cross join seed_lists l
) s
where d.id = s.id;

-- Contracts still being negotiated have their funding known, sometimes a quote.
update public.deals d
set
    qualiopi = s.r_qualiopi < 0.8,
    funding_type = pg_temp.pick(array['opco', 'hr_hse', 'cse', 'other'], s.r_funding),
    quote_signed = s.r_quote < 0.5,
    quote_signed_at = case when s.r_quote < 0.5 then current_date - (1 + floor(s.r_quote * 40))::int end,
    agreement_signed = false
from (
    select sd.id, random() as r_qualiopi, random() as r_funding, random() as r_quote
    from seed_deals sd
    where sd.stage = 'in-negociation'
) s
where d.id = s.id;

-- Training recap shown in the "Formations" panel of each client company.
update public.companies c
set
    nb_trainings_delivered = w.nb_won,
    training_date = w.last_training,
    quote_approved = true,
    service_invoiced = w.nb_won > 1
from (
    select d.company_id, count(*)::int as nb_won, max(d.expected_closing_date) as last_training
    from public.deals d
    join seed_deals sd on sd.id = d.id
    where d.stage = 'won'
    group by d.company_id
) w
where c.id = w.company_id;

--
-- 6. Notes: up to four per contact, up to two per deal.
--
with slots as materialized (
    select c.id, c.status, c.sales_id, c.first_seen, random() as r_text, random() as r_date
    from (
        select sc.*, floor(random() * 5)::int as nb_notes
        from seed_contacts sc
    ) c
    cross join lateral generate_series(1, c.nb_notes)
)
insert into public.contact_notes (contact_id, text, date, status, sales_id)
select
    s.id,
    pg_temp.pick(l.contact_notes, s.r_text),
    s.first_seen + s.r_date * (now() - s.first_seen),
    s.status,
    s.sales_id
from slots s
cross join seed_lists l;

-- Each note above moved the `last_seen` of its contact: no more bulk write on
-- contacts from here, the gravatar lookup can come back.
alter table public.contacts enable trigger "20_contact_saved";

with slots as materialized (
    select d.id, d.sales_id, d.created_at, random() as r_text, random() as r_date
    from (
        select sd.*, floor(random() * 3)::int as nb_notes
        from seed_deals sd
    ) d
    cross join lateral generate_series(1, d.nb_notes)
)
insert into public.deal_notes (deal_id, text, date, sales_id)
select
    s.id,
    pg_temp.pick(l.deal_notes, s.r_text),
    s.created_at + s.r_date * (now() - s.created_at),
    s.sales_id
from slots s
cross join seed_lists l;

--
-- 7. Meetings (tasks): up to three per contact, from 90 days ago to 60 days
--    ahead, on a working hour of a week day (Paris time). `type` and `mode` are
--    `choices` labels; `location` stays empty for the remote modes.
--
with slots as materialized (
    select
        c.id, c.sales_id, co.city,
        random() as r_type, random() as r_mode, random() as r_text, random() as r_day,
        random() as r_hour, random() as r_done, random() as r_duration
    from (
        select sc.*, floor(random() * 4)::int as nb_tasks
        from seed_contacts sc
    ) c
    join seed_companies co on co.id = c.company_id
    cross join lateral generate_series(1, c.nb_tasks)
),
planned as (
    select
        s.*,
        pg_temp.pick(l.rdv_modes, s.r_mode) as mode,
        date_trunc('day', now() at time zone 'Europe/Paris')
            + make_interval(days => floor(s.r_day * 150)::int - 90, hours => 8 + floor(s.r_hour * 10)::int) as local_due
    from slots s
    cross join seed_lists l
),
scheduled as (
    select
        p.*,
        -- Saturday and Sunday meetings move to the next Monday.
        (
            p.local_due + make_interval(days => case extract(isodow from p.local_due)::int
                when 6 then 2
                when 7 then 1
                else 0
            end)
        ) at time zone 'Europe/Paris' as due_date
    from planned p
)
insert into public.tasks (contact_id, type, mode, location, text, due_date, done_date, duration_minutes, sales_id)
select
    t.id,
    pg_temp.pick(l.rdv_types, t.r_type),
    t.mode,
    case
        when t.mode = 'Salon' then 'Salon Préventica, ' || t.city
        when t.mode = 'Présentiel' then pg_temp.pick(array['Siège, ', 'Agence de ', 'Site de '], t.r_text) || t.city
    end,
    pg_temp.pick(l.task_texts, t.r_text),
    t.due_date,
    case when t.due_date < now() and t.r_done < 0.85 then t.due_date end,
    pg_temp.pick(array[30, 60, 60, 90, 120], t.r_duration),
    t.sales_id
from scheduled t
cross join seed_lists l;

--
-- 8. Assessments ("états des lieux") for four companies out of ten, with the
--    diagnosis step filled in. Array values are the choice ids of
--    `diagnosticChoices.ts`, not labels. `level` is the overall IMPACT 360
--    profile (1 to 3) the other answers are derived from.
--
with slots as materialized (
    select
        sc.id, sc.created_at,
        random() as r_keep, random() as r_age, random() as r_level, random() as r_maturity,
        random() as r_owners, random() as r_forums, random() as r_programs, random() as r_training,
        random() as r_confidence, random() as r_issues, random() as r_strengths, random() as r_barriers,
        random() as r_urgency, random() as r_priority, random() as r_text,
        random() as r_d1, random() as r_d2, random() as r_d3, random() as r_d4, random() as r_d5, random() as r_d6
    from seed_companies sc
),
leveled as (
    select s.*, 1 + floor(s.r_level * 3)::int as level
    from slots s
    where s.r_keep < 0.4
)
insert into public.assessments (
    company_id, created_at,
    governance_maturity, governance_owners, governance_forums,
    existing_programs, existing_programs_comments,
    manager_training, manager_confidence,
    priority_issues, priority_issues_comments,
    company_strengths, identified_barriers,
    urgency_level, client_priority_1, client_priority_2,
    impact_awareness, impact_management, impact_prevention,
    impact_steering, impact_culture, impact_measurement,
    overall_profile_level, overall_profile_comments
)
select
    a.id,
    a.created_at + a.r_age * (now() - a.created_at),
    (array['no_approach', 'occasional_actions', 'being_structured', 'integrated_in_qvct'])[a.level + floor(a.r_maturity * 2)::int],
    pg_temp.slice(
        array['executive_management', 'hr_department', 'managers', 'cse', 'cssct', 'qvct_lead', 'hse_department'],
        a.r_owners, a.level
    ),
    pg_temp.slice(array['codir_comex', 'cse', 'cssct', 'manager_meetings', 'duerp'], a.r_forums, a.level),
    case
        when a.level = 1 and a.r_programs < 0.4 then array['none']
        else pg_temp.slice(
            array[
                'social_barometer', 'qvct_survey', 'listening_unit', 'psychological_support', 'occupational_health',
                'workshops', 'safety_days', 'awareness_sessions', 'pssm', 'manager_training'
            ],
            a.r_programs, 1 + a.level
        )
    end,
    case
        when a.level = 1 and a.r_programs < 0.4 then l.program_comments[5]
        else pg_temp.pick(l.program_comments[1:4] || l.program_comments[6:6], a.r_text)
    end,
    case
        when a.level = 1 then array['none']
        else pg_temp.slice(
            array['weak_signals', 'struggling_employee', 'workplace_mental_health', 'psychosocial_risks'],
            a.r_training, a.level - 1
        )
    end,
    (array['struggling', 'not_very_comfortable', 'fairly_comfortable', 'very_comfortable'])[a.level + floor(a.r_confidence * 2)::int],
    pg_temp.slice(
        array[
            'chronic_stress', 'mental_load', 'fatigue', 'burnout', 'disengagement', 'relational_tensions',
            'absenteeism', 'recruitment_difficulties', 'turnover', 'reorganization'
        ],
        a.r_issues, 3
    ),
    pg_temp.pick(l.issue_comments, a.r_issues),
    pg_temp.slice(
        array[
            'engaged_management', 'mobilized_managers', 'dialogue_culture', 'existing_qvct_approach',
            'internal_communication', 'willingness_to_improve', 'internal_network'
        ],
        a.r_strengths, 2
    ),
    pg_temp.slice(
        array[
            'budget', 'time', 'team_availability', 'competing_priorities', 'change_resistance', 'lack_of_buy_in',
            'organizational_difficulties'
        ],
        a.r_barriers, 2
    ),
    pg_temp.pick(
        array['immediate', 'three_to_six_months', 'three_to_six_months', 'six_to_twelve_months', 'more_than_a_year'],
        a.r_urgency
    ),
    pg_temp.pick(l.client_priorities[1:4], a.r_priority),
    pg_temp.pick(l.client_priorities[5:8], a.r_priority),
    least(4, greatest(1, a.level + floor(a.r_d1 * 3)::int - 1)),
    least(4, greatest(1, a.level + floor(a.r_d2 * 3)::int - 1)),
    least(4, greatest(1, a.level + floor(a.r_d3 * 3)::int - 1)),
    least(4, greatest(1, a.level + floor(a.r_d4 * 3)::int - 1)),
    least(4, greatest(1, a.level + floor(a.r_d5 * 3)::int - 1)),
    least(4, greatest(1, a.level + floor(a.r_d6 * 3)::int - 1)),
    a.level,
    l.profile_comments[a.level]
from leveled a
cross join seed_lists l;

commit;

--
-- Totals now in the database, shown as the result of the script.
--
select
    (select count(*) from public.companies) as companies,
    (select count(*) from public.contacts) as contacts,
    (select count(*) from public.deals) as deals,
    (select count(*) from public.contact_notes) as contact_notes,
    (select count(*) from public.deal_notes) as deal_notes,
    (select count(*) from public.tasks) as tasks,
    (select count(*) from public.assessments) as assessments;
