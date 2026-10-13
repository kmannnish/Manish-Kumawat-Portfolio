-- ============================================================
-- 0002_tables.sql
-- All tables in the order required by foreign-key dependencies.
--   1. media, documents — referenced by every other table
--   2. copy, site_settings — standalone globals
--   3. sections, projects, experience, tech — core entities
--   4. project_tech, project_media — join tables
--   5. posts, testimonials, nav_items, admins — supporting
--   6. contact_submissions — last (IP hash, rate-limit target)
-- ============================================================

-- ── media ──────────────────────────────────────────────────────────────────
-- `kind` includes design-specific values added in S2:
--   image, video, audio | poster, print, stage, mockup
-- `caption` and `tool_tags` are for design work (e.g. "Photoshop", "CorelDraw").
-- `video_url` holds a hosted video embed for large clips (Supabase storage
-- is not a CDN; unlisted YouTube/Vimeo embeds keep egress at zero cost).

create table media (
  id               uuid primary key default gen_random_uuid(),
  bucket           text not null default 'media',
  path             text not null,
  kind             media_kind not null default 'image',
  alt_text         text not null default '',
  caption          text,                                 -- design caption
  tool_tags        text[] not null default '{}',          -- e.g. {Photoshop,CorelDraw}
  width            integer,
  height           integer,
  duration_seconds numeric,
  byte_size        bigint,
  mime_type        text,
  placeholder       text,                                 -- base64 blur or dominant colour
  video_url        text,                                 -- hosted video embed URL
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (bucket, path)
);

-- ── documents ────────────────────────────────────────────────────────────────
create table documents (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  bucket     text not null default 'documents',
  path       text not null,
  mime_type  text,
  byte_size  bigint,
  version    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);

-- ── copy ────────────────────────────────────────────────────────────────────
-- Every user-facing string lives here. Consumed via t(map, 'key', fallback).
create table copy (
  key        text primary key,
  value      text not null default '',
  kind       text not null default 'text'
              check (kind in ('text', 'richtext', 'markdown')),
  group_name text not null default 'general',
  label      text not null,
  help       text,
  updated_at timestamptz not null default now()
);

-- ── site_settings ───────────────────────────────────────────────────────────
-- Enforced single-row via `primary key ... check (id)`.
create table site_settings (
  id                  boolean primary key default true check (id),
  owner_name          text not null default '',
  role_title         text not null default '',
  tagline            text not null default '',
  currently          text not null default '',
  location           text,
  contact_email       text,
  seo_title           text,
  seo_description    text,
  og_image_id         uuid references media(id) on delete set null,
  resume_document_id  uuid references documents(id) on delete set null,
  social_links        jsonb not null default '[]'::jsonb,
  updated_at         timestamptz not null default now()
);

-- ── sections ─────────────────────────────────────────────────────────────────
create table sections (
  id         uuid primary key default gen_random_uuid(),
  kind       section_kind not null,
  title      text,
  subtitle   text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  config     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── projects ─────────────────────────────────────────────────────────────────
-- `show_in_design_section` causes the project to appear in both the engineering
-- work index and the graphic-design gallery (S3/S4 additions).
create table projects (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  title                 text not null,
  summary               text not null default '',
  body                  text not null default '',
  role                  text,
  client_name           text,
  started_on            date not null,
  ended_on              date,
  status                publish_status not null default 'draft',
  is_featured           boolean not null default false,
  show_in_design_section boolean not null default false,      -- S2 design addition
  sort_order            integer not null default 0,
  accent_color          text,
  problem               text,
  approach              text,
  outcome               text,
  metrics               jsonb not null default '[]'::jsonb,
  links                 jsonb not null default '[]'::jsonb,
  cover_media_id        uuid references media(id) on delete set null,
  seo_title             text,
  seo_description       text,
  published_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint projects_dates_sane check (ended_on is null or ended_on >= started_on)
);
create index on projects (status, sort_order);

-- ── experience ──────────────────────────────────────────────────────────────
create table experience (
  id               uuid primary key default gen_random_uuid(),
  organization     text not null,
  role             text not null,
  location         text,
  employment_type  text check (employment_type in ('full-time', 'contract', 'advisory')),
  started_on       date not null,
  ended_on         date,
  summary          text,
  highlights       jsonb not null default '[]'::jsonb,
  accent_color     text,
  is_visible       boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint experience_dates_sane check (ended_on is null or ended_on >= started_on)
);

-- ── tech ─────────────────────────────────────────────────────────────────────
create table tech (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  category        text not null
                  check (category in
                    ('language', 'framework', 'model', 'infra', 'data', 'tooling', 'design')),
  icon_media_id   uuid references media(id) on delete set null,
  proficiency     smallint check (proficiency between 1 and 5),
  is_featured     boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── project_tech ─────────────────────────────────────────────────────────────
create table project_tech (
  project_id uuid references projects(id) on delete cascade,
  tech_id    uuid references tech(id)     on delete cascade,
  primary key (project_id, tech_id)
);

-- ── project_media ────────────────────────────────────────────────────────────
create table project_media (
  project_id  uuid references projects(id) on delete cascade,
  media_id    uuid references media(id)   on delete cascade,
  role        text not null default 'gallery'
              check (role in ('cover', 'gallery', 'inline')),
  sort_order  integer not null default 0,
  primary key (project_id, media_id)
);

-- ── posts ────────────────────────────────────────────────────────────────────
create table posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  body            text not null default '',
  status          publish_status not null default 'draft',
  reading_minutes integer,
  cover_media_id  uuid references media(id) on delete set null,
  tags            jsonb not null default '[]'::jsonb,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── testimonials ─────────────────────────────────────────────────────────────
create table testimonials (
  id               uuid primary key default gen_random_uuid(),
  author_name      text not null,
  author_role      text,
  author_org       text,
  quote            text not null,
  author_media_id  uuid references media(id) on delete set null,
  source_url       text,
  is_visible       boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── nav_items ────────────────────────────────────────────────────────────────
create table nav_items (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  href        text not null,
  sort_order  integer not null default 0,
  is_external boolean not null default false,
  is_visible  boolean not null default true,
  updated_at  timestamptz not null default now()
);

-- ── admins ───────────────────────────────────────────────────────────────────
-- auth.users is managed by Supabase Auth; we track which auth users are admins.
-- No trigger, no self-service add/remove — membership is changed by the owner
-- in the SQL editor. See docs/03-data-model.md §3.
create table admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- ── contact_submissions ──────────────────────────────────────────────────────
-- anon has NO insert policy — writes go through the service-role route handler.
create table contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  email       text not null,
  message     text not null,
  phone       text,
  status      submission_status not null default 'new',
  meta        jsonb not null default '{}'::jsonb,
  ip_hash     text,                                   -- salted, never raw IP
  spam_score  numeric,
  notes       text,
  replied_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on contact_submissions (status, created_at desc);
create index on contact_submissions (ip_hash, created_at desc);   -- rate limiting
