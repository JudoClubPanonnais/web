-- ================================================
-- JUDO CLUB PANONNAIS — Schéma base de données
-- ================================================

-- Causes / projets
create table if not exists causes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_desc text,
  description text,
  icon text,
  goal_amount integer default 0,
  collected_amount integer default 0,
  votes integer default 0,
  color text default '#1e3a5f',
  sort_order integer default 0,
  created_at timestamp default now()
);

-- Migration pour une base existante (déjà créée avant l'ajout du système de votes) :
-- alter table causes add column if not exists votes integer default 0;

-- Dons
create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  cause_id uuid references causes(id),
  amount integer not null,
  donor_name text,
  donor_email text,
  message text,
  stripe_payment_intent text,
  stripe_session_id text,
  payment_method text default 'card',
  status text default 'pending',
  anonymous boolean default false,
  fiscal_receipt boolean default true,
  created_at timestamp default now()
);

-- Cours
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  day_of_week text,
  time_start text,
  time_end text,
  age_min integer,
  age_max integer,
  level text,
  location text default 'Dojo JCP — Bras Panon',
  max_participants integer,
  active boolean default true,
  created_at timestamp default now()
);

-- Événements
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date,
  event_time text,
  location text,
  type text default 'competition',
  image_url text,
  registration_required boolean default false,
  created_at timestamp default now()
);

-- Inscriptions aux cours
create table if not exists course_registrations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  birth_date date,
  address text,
  emergency_contact text,
  emergency_phone text,
  medical_notes text,
  status text default 'pending',
  created_at timestamp default now()
);

-- Articles presse
create table if not exists press_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  publication text,
  article_date date,
  url text,
  excerpt text,
  image_url text,
  featured boolean default false,
  created_at timestamp default now()
);

-- Newsletter abonnés
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  last_name text,
  active boolean default true,
  subscribed_at timestamp default now(),
  unsubscribed_at timestamp
);

-- Campagnes newsletter
create table if not exists newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preview_text text,
  content_html text,
  content_json jsonb,
  status text default 'draft',
  sent_at timestamp,
  recipient_count integer default 0,
  open_count integer default 0,
  created_at timestamp default now()
);

-- Réseaux sociaux
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  icon text,
  label text,
  active boolean default true,
  sort_order integer default 0,
  updated_at timestamp default now()
);

-- Visites pages (tracking anonyme)
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  user_agent text,
  country text,
  city text,
  session_id text,
  created_at timestamp default now()
);

-- Admins
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role text default 'admin',
  created_at timestamp default now()
);

-- ================================================
-- Données initiales — Causes
-- ================================================
insert into causes (slug, name, short_desc, icon, goal_amount, collected_amount, color, sort_order) values
  ('lutte-delinquance', 'Lutte contre la délinquance', 'Offrir aux jeunes en rupture une alternative structurante via le judo', '🚨', 350000, 0, '#dc2626', 1),
  ('perseverance-scolaire', 'Persévérance scolaire', 'Créer le lien entre sport, école et famille pour que chaque enfant tienne bon', '📚', 280000, 0, '#2563eb', 2),
  ('inclusion-autisme', 'Inclusion autisme & sport', 'Le tatami comme espace prévisible, un vecteur d''inclusion et d''autonomie', '🤝', 420000, 0, '#7c3aed', 3),
  ('violences-femmes', 'Lutte contre les violences faites aux femmes', 'L''autodéfense est un droit. Reprendre le contrôle de son corps, c''est reprendre le contrôle de sa vie', '💜', 300000, 0, '#db2777', 4),
  ('decouverte-ailleurs', 'Découverte de l''ailleurs', 'Le judo est une langue universelle. Partout où l''on pose un tatami, on se comprend', '✈️', 500000, 0, '#059669', 5)
on conflict (slug) do nothing;

-- Données initiales — Cours
insert into courses (name, description, day_of_week, time_start, time_end, age_min, age_max, level) values
  ('Baby Judo', 'Éveil corporel et motricité pour les tout-petits', 'Mercredi', '09:00', '10:00', 4, 6, 'Débutant'),
  ('Mini Poussins', 'Initiation au judo dans le jeu et la découverte', 'Mercredi', '10:00', '11:00', 6, 8, 'Débutant'),
  ('Poussins / Benjamins', 'Apprentissage des techniques de base', 'Mercredi', '11:00', '12:00', 8, 12, 'Débutant'),
  ('Minimes / Cadets', 'Perfectionnement technique et compétition', 'Mardi', '18:00', '19:30', 12, 17, 'Intermédiaire'),
  ('Juniors / Seniors', 'Entraînement avancé, compétition et kata', 'Mardi', '19:30', '21:00', 17, 99, 'Avancé'),
  ('Juniors / Seniors', 'Entraînement avancé, compétition et kata', 'Jeudi', '19:30', '21:00', 17, 99, 'Avancé'),
  ('Judo Loisir Adultes', 'Judo en loisir, sans contrainte de compétition', 'Vendredi', '18:30', '20:00', 18, 99, 'Tous niveaux'),
  ('Cours Spécial TSA', 'Cours adapté pour enfants autistes', 'Samedi', '09:00', '10:00', 5, 16, 'Adapté'),
  ('Autodéfense Femmes', 'Stage autodéfense réservé aux femmes', 'Samedi', '10:00', '11:30', 16, 99, 'Tous niveaux')
on conflict do nothing;

-- Données initiales — Articles presse
insert into press_articles (title, publication, article_date, excerpt, featured) values
  ('Le Judo Club Panonnais lance sa grande collecte solidaire', 'Le Quotidien de La Réunion', '2026-01-15', 'Le club judoka de Bras Panon lance une campagne de dons ambitieuse pour financer cinq causes sociales prioritaires à hauteur de 40 000 €.', true),
  ('Sport et inclusion : le JCP ouvre ses tatamis aux enfants autistes', 'Clicanoo', '2025-11-20', 'Un créneau hebdomadaire spécialement aménagé pour accueillir des enfants présentant des troubles du spectre autistique.', true),
  ('Bras Panon : le judo contre la délinquance juvénile', 'Journal de l''île de La Réunion', '2025-09-08', 'En partenariat avec la Protection Judiciaire de la Jeunesse, le JCP propose des cours gratuits aux jeunes en difficulté.', false),
  ('Les judokas de Bras Panon s''envolent pour le Japon', 'Réunion La 1ère', '2025-06-30', 'Cinq jeunes pratiquants du Judo Club Panonnais ont participé à un voyage culturel et sportif au Japon, berceau du judo.', false),
  ('La présidente du JCP récompensée pour son engagement social', 'Zinfos974', '2025-03-12', 'La présidente du Judo Club Panonnais a reçu le prix de l''engagement associatif décerné par la Mairie de Bras Panon.', false)
on conflict do nothing;

-- Données initiales — Réseaux sociaux
insert into social_links (platform, url, icon, label, sort_order) values
  ('facebook', 'https://www.facebook.com/judoclubpanonnais', 'facebook', 'Facebook', 1),
  ('instagram', 'https://www.instagram.com/judoclubpanonnais', 'instagram', 'Instagram', 2),
  ('youtube', 'https://www.youtube.com/@judoclubpanonnais', 'youtube', 'YouTube', 3)
on conflict do nothing;

-- Colonnes paiement pour inscriptions (à exécuter si pas déjà fait)
alter table course_registrations add column if not exists price integer default 0;
alter table course_registrations add column if not exists payment_installments integer default 1;
alter table course_registrations add column if not exists payment_method text default 'cash';
alter table course_registrations add column if not exists course_type text default 'payant';
alter table course_registrations add column if not exists payment_status text default 'pending';
alter table course_registrations add column if not exists amount_paid integer default 0;

-- Table historique des paiements
create table if not exists payment_history (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references course_registrations(id) on delete cascade,
  amount integer not null,
  payment_method text,
  payment_date date default current_date,
  note text,
  created_at timestamp default now()
);

-- Factures
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references course_registrations(id) on delete cascade,
  invoice_number integer not null unique,
  amount integer not null,
  payment_method text,
  issued_at timestamp default now(),
  sent_at timestamp
);
