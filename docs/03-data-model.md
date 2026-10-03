# Data model — zero hardcoding

The requirement is "100% control, even a single text, nothing hardcoded." That is stronger than what most CMS-backed sites meet, and it needs one specific table people usually skip. This document is the contract; `CLAUDE.md` enforces it.

---

## 1. The architecture in one paragraph

Three layers. **Typed tables** hold repeating entities with real structure — projects, experience, posts. A **`copy` table** holds every standalone string in the interface, keyed by dotted path, so the hero headline and the contact form's submit label are both database rows. A **`site_settings`** single-row table holds globals. Nothing in the UI contains a literal user-facing string; every one resolves through a lookup with a fallback.

The `copy` table is what makes the brief literally true, and the part most builds omit.

---

## 2. Tables

**Create them in the order given below.** Several tables carry foreign keys into `media` and `documents`, so those two come first. Getting this wrong means `supabase db reset` fails with `relation "media" does not exist`.

### Enums (first migration)

```sql
create type publish_status    as enum ('draft','published','archived');
create type section_kind      as enum ('hero','trace','work','writing','skills','about','testimonials','contact','custom');
create type media_kind        as enum ('image','video','audio');
create type submission_status as enum ('new','read','replied','archived','spam');
```

### `media` — before anything that references it

```sql
create table media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'media',
  path        text not null,
  kind        media_kind not null default 'image',
  alt_text    text not null default '',   -- required by the admin form for images
  caption     text,
  width       integer,
  height      integer,
  duration_seconds numeric,
  byte_size   bigint,
  mime_type   text,
  placeholder text,                        -- base64 blur or dominant colour
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (bucket, path)
);
```

`width`/`height` let `next/image` reserve space and avoid layout shift; `placeholder` powers `blurDataURL`. Both are cheap at upload time and painful to backfill.

### `documents`

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  label     text not null,
  bucket    text not null default 'documents',
  path      text not null,
  mime_type text,
  byte_size bigint,
  version   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);
```

### `copy` — every single string

```sql
create table copy (
  key        text primary key,            -- 'hero.headline', 'contact.submit_label'
  value      text not null default '',
  kind       text not null default 'text'
             check (kind in ('text','richtext','markdown')),
  group_name text not null default 'general',  -- groups fields in the admin UI
  label      text not null,                    -- human label shown in admin
  help       text,                             -- hint under the field
  updated_at timestamptz not null default now()
);
```

Consumed through a helper that **never throws on a missing key**:

```ts
// lib/copy.ts
export function t(map: Record<string, string>, key: string, fallback = '') {
  return map[key] ?? fallback;
}
```

A missing row must degrade to the fallback, never to a blank page. Without this, deleting one row in the admin panel can white-screen the site.

### `site_settings` — enforced single row

```sql
create table site_settings (
  id                 boolean primary key default true check (id),
  owner_name         text not null default '',
  role_title         text not null default '',
  tagline            text not null default '',
  currently          text not null default '',   -- see 01-reference-teardown.md, final section
  location           text,
  contact_email      text,
  seo_title          text,
  seo_description    text,
  og_image_id        uuid references media(id) on delete set null,
  resume_document_id uuid references documents(id) on delete set null,
  social_links       jsonb not null default '[]'::jsonb,  -- [{label,url,icon}]
  updated_at         timestamptz not null default now()
);
```

`boolean primary key ... check (id)` makes the table physically incapable of holding more than one row. It does **not** guarantee a row exists — the seed must insert exactly one, or `site_settings` reads return undefined and the top bar renders empty.

Three columns from an earlier draft are gone, for the same reason each time — **nothing consumed them**: `theme` (token overrides belong in code), `availability` (`currently` already covers it in prose), and `feature_flags` (no flag was ever named, and an empty jsonb bag invites hardcoded key strings, which is law #1 in reverse). `02-design-direction.md` §7 lists where every remaining field renders; if you add a column here, add a row there in the same change.

### `sections` — the page composer

```sql
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
```

This is what lets whole page sections be reordered or hidden from admin without a deploy. The public page iterates `sections` in `sort_order` and switches on `kind`.

### `projects`

```sql
create table projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  summary         text not null default '',
  body            text not null default '',       -- markdown
  role            text,
  client_name     text,
  started_on      date not null,                   -- NOT NULL: see constraint note
  ended_on        date,                            -- null = ongoing, feeds the trace
  status          publish_status not null default 'draft',
  is_featured     boolean not null default false,
  sort_order      integer not null default 0,
  accent_color    text,                            -- from the curated palette only
  problem         text,
  approach        text,
  outcome         text,
  metrics         jsonb not null default '[]'::jsonb,
  links           jsonb not null default '[]'::jsonb,  -- [{label,url,kind}]
  cover_media_id  uuid references media(id) on delete set null,
  seo_title       text,
  seo_description text,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint projects_dates_sane check (ended_on is null or ended_on >= started_on)
);
create index on projects (status, sort_order);
```

**`started_on` is `not null` deliberately.** With a nullable start, `check (ended_on is null or ended_on >= started_on)` evaluates to NULL and silently passes for a row that has an end date and no start — which the trace chart would render as a bar with no left edge.

`metrics` shape, with the headline flag the work index needs:

```json
[{ "label": "p95 latency", "before": "4.2s", "after": "610ms",
   "unit": null, "is_headline": true }]
```

Exactly one entry should carry `is_headline: true`; if none does, the first element wins. The work index shows the headline metric in `--ink`; the detail page shows it in `--mark`.

**Enforce the metric rule in the admin form, not the schema.** A CHECK constraint on JSONB contents is possible but brittle and gives a useless error message. S12 blocks publishing when `metrics` is empty. Note the consequence: until S12 exists, nothing enforces it, so S2's seed has to be well-formed by hand.

### `experience`

```sql
create table experience (
  id              uuid primary key default gen_random_uuid(),
  organization    text not null,
  role            text not null,
  location        text,
  employment_type text,                    -- full-time | contract | advisory
  started_on      date not null,
  ended_on        date,                     -- null = current
  summary         text,
  highlights      jsonb not null default '[]'::jsonb,
  accent_color    text,
  is_visible      boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint experience_dates_sane check (ended_on is null or ended_on >= started_on)
);
```

`started_on` and `ended_on` are what the trace chart renders. Multiple rows may have `ended_on is null`; only the **latest-starting** one gets `--mark`.

### Everything else

```sql
create table tech (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text unique not null,
  category text not null check (category in
    ('language','framework','model','infra','data','tooling','design')),
  icon_media_id uuid references media(id) on delete set null,
  proficiency smallint check (proficiency between 1 and 5),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_tech (
  project_id uuid references projects(id) on delete cascade,
  tech_id    uuid references tech(id)     on delete cascade,
  primary key (project_id, tech_id)
);

create table project_media (
  project_id uuid references projects(id) on delete cascade,
  media_id   uuid references media(id)    on delete cascade,
  role       text not null default 'gallery'
             check (role in ('cover','gallery','inline')),
  sort_order integer not null default 0,
  primary key (project_id, media_id)
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null,
  excerpt text, body text not null default '',
  status publish_status not null default 'draft',
  reading_minutes integer,
  cover_media_id uuid references media(id) on delete set null,
  tags jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null, author_role text, author_org text,
  quote text not null,
  author_media_id uuid references media(id) on delete set null,
  source_url text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null, href text not null,
  sort_order integer not null default 0,
  is_external boolean not null default false,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);
```

There is no `audit_log` table. An earlier draft had one that no trigger populated and no page read — a dead table that would have shipped with RLS blocking the writes nobody was making. If you later want a public changelog, add it together with the `security definer` trigger that writes it.

### `contact_submissions`

```sql
create table contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company    text,
  email      text not null,
  message    text not null,
  phone      text,
  status     submission_status not null default 'new',
  meta       jsonb not null default '{}'::jsonb,  -- user_agent, referrer, country
  ip_hash    text,                                 -- hashed, never the raw IP
  spam_score numeric,
  notes      text,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on contact_submissions (status, created_at desc);
create index on contact_submissions (ip_hash, created_at desc);  -- for rate limiting
```

Store a **salted hash** of the IP, never the IP. You get rate limiting and abuse detection without holding personal data you have no reason to keep. The salt is `CONTACT_IP_SALT` in the env list below.

---

## 3. Row Level Security

```sql
create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

revoke execute on function public.is_admin() from public;
grant  execute on function public.is_admin() to authenticated;
```

Three things about this function are load-bearing:

**`security definer` is mandatory, not stylistic.** The body queries `admins`, and `admins` has RLS whose policy calls `is_admin()`. `security definer` makes the body run as the function owner, who bypasses RLS, which is what breaks the cycle. **Never apply `alter table admins force row level security`** — that strips the owner's bypass and you get `42P17: infinite recursion detected in policy for relation "admins"`.

**Wrap calls in a subselect.** `using ((select public.is_admin()))` lets Postgres evaluate it once as an InitPlan rather than per row. Irrelevant at portfolio scale, but the unwrapped form is what Supabase's performance advisor flags, so write it correctly from the start.

**`revoke execute from public`** stops `anon` calling it directly. It would only ever return false, but it's a free line.

### The matrix — every table, no exceptions

RLS enabled with no policy is a silently empty table, which is its own kind of bug. Enable RLS on all fifteen tables and give each an explicit policy.

| Table | Public (`anon`) read | Admin |
|---|---|---|
| `copy` | all rows | full |
| `site_settings` | all rows | full |
| `sections` | `is_visible` | full |
| `nav_items` | `is_visible` | full |
| `media` | all rows | full |
| `documents` | all rows | full |
| `tech` | all rows | full |
| `projects` | `status in ('published','archived')` | full |
| `experience` | `is_visible` | full |
| `posts` | `status = 'published'` | full |
| `testimonials` | `is_visible` | full |
| `project_tech` | all rows | full |
| `project_media` | all rows | full |
| `admins` | **none** | select only — no write policy at all (see below) |
| `contact_submissions` | **none (no insert either)** | read + update |

Two entries deserve explanation.

**`projects` admits `'archived'`, not just `'published'`.** The `/archive` page lists the full back catalogue, so if the policy were `status = 'published'` alone, `'archived'` would be functionally identical to `'draft'` and the archive table would render zero rows. Published projects appear in the work index; archived ones appear only in the archive table.

**`admins` must have a policy.** Without one, any authenticated user — which includes anyone who signs up — can `select * from admins` and read every admin's `user_id` and email.

The shape, applied per table:

```sql
alter table projects enable row level security;

create policy "public reads published projects"
  on projects for select to anon, authenticated
  using (status in ('published','archived'));

create policy "admins manage projects"
  on projects for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- admins: readable to admins, writable by nobody through the API
alter table admins enable row level security;
create policy "admins read admins" on admins for select to authenticated
  using ((select public.is_admin()));
```

**`admins` gets a select policy and nothing else, deliberately.** There is no insert, update or delete policy, so no API caller — not even an authenticated admin — can grant or revoke admin rights. Membership is changed by you, in the SQL editor. The roadmap has no admin-management UI for exactly this reason: a self-service "add admin" form on a single-operator site is a privilege-escalation surface with no corresponding benefit. If you ever do need it, add a `security definer` function with an explicit allowlist rather than an `for all` policy on this table.

### `contact_submissions` is deliberately different

Do **not** grant `anon` an insert policy. An open insert policy on a public table is an open spam endpoint — Supabase's REST API is directly reachable, so no client-side validation protects it.

```sql
alter table contact_submissions enable row level security;
-- no anon policy at all. Inserts happen server-side with the service role,
-- which bypasses RLS.

create policy "admins read submissions" on contact_submissions
  for select to authenticated using ((select public.is_admin()));
create policy "admins update submissions" on contact_submissions
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
```

Submissions go through a Next.js route handler holding the service role key server-side, applying in order: honeypot field, minimum time-on-form, Zod validation, Turnstile verification, rate limit.

**The rate limit has to be Postgres-backed.** Vercel functions are stateless and the stack has no KV or Redis, so in-memory counters don't work. Count recent rows instead, from the service-role client before inserting:

```sql
select count(*) from contact_submissions
where ip_hash = $1 and created_at > now() - interval '1 hour';
```

Reject above a threshold (five is generous). This only counts requests that got as far as an insert, which is the accepted limitation — Turnstile and the honeypot handle the volume cases.

---

## 4. Triggers and helpers

```sql
create or replace function public.touch_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end $$;

-- attach to every table that has updated_at
create trigger touch before update on projects
  for each row execute function public.touch_updated_at();
```

`set search_path` is here even though this function touches no tables — Supabase's database linter flags every `public` function without it, and a clean linter report is worth more than one saved line.

The freshness stamp from the teardown — a claim no static site can make:

```sql
create or replace function public.content_last_updated()
returns timestamptz
language sql security definer stable
set search_path = public
as $$
  select max(t) from (
    select max(updated_at) from projects where status = 'published'
    union all select max(updated_at) from experience where is_visible
    union all select max(updated_at) from posts where status = 'published'
    union all select max(updated_at) from sections where is_visible
    union all select max(updated_at) from copy
    union all select max(updated_at) from site_settings
  ) s(t);
$$;
```

It must be `security definer`. Called as `anon` it runs under RLS, and any table whose policy filters rows differently than intended would silently contribute NULL — a footer stamp that quietly stops reflecting half your content.

---

## 5. Storage

Buckets have to be created; they don't appear because a column defaults to their name.

```sql
insert into storage.buckets (id, name, public)
values ('media', 'media', true), ('documents', 'documents', true)
on conflict (id) do nothing;
```

Writes must be admin-only, and you need all three verbs — S13 requires replace and delete, not just upload:

```sql
create policy "admins write media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "admins update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

create policy "admins delete media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
-- repeat all three for bucket_id = 'documents'
```

**Watch for an ownership error here.** On hosted Supabase, `storage.objects` is owned by `supabase_storage_admin`, and `postgres` running a migration can hit `must be owner of table objects`. It typically succeeds locally and fails on deploy, which is the worst failure shape. If that happens, create these policies through the Supabase dashboard's storage policy editor and keep the SQL in the migration as a comment.

Public-read buckets with unguessable paths are the right call for a portfolio — everything in it is meant to be seen. Enforce file type and size limits in the route handler, not just the `<input accept>`.

---

## 6. Environment variables

No document should require you to guess these. The full set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only. Never NEXT_PUBLIC_.
RESEND_API_KEY=
CONTACT_NOTIFY_EMAIL=             # where submissions are delivered
RESEND_FROM_EMAIL=                # must be on a verified domain
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
CONTACT_IP_SALT=                  # random string, salts ip_hash
```

---

## 7. Seed data

Write `supabase/seed.sql` with realistic content: **exactly one `site_settings` row**, **four** projects each with well-formed `metrics` including one `is_headline`, three experience rows with overlapping dates so the trace chart has something interesting to render, a full set of `copy` rows, and an `admins` row for your own user once you've signed up.

This is load-bearing for the build order in `04-build-roadmap.md`: with a good seed you design the entire public site against the real schema and real queries, with no hardcoded strings, before the admin panel exists. The seed is also what makes `supabase db reset` a safe habit.

---

## 8. What this actually costs

Honest accounting. **Verify every figure before relying on it** — free tiers shift and my knowledge runs to roughly mid-2026.

| Service | Tier | Limits | Watch out for |
|---|---|---|---|
| Vercel | Hobby, $0 | Generous for a portfolio | Hobby is **non-commercial**. Showing your work is fine; selling services through it is arguably commercial and pushes you to Pro at ~$20/mo. |
| Supabase | Free, $0 | ~500MB database, ~1GB storage, ~5GB egress/mo | **Projects pause after ~7 days of inactivity** — a cheap uptime ping avoids a cold first visit. Also: free organisations are capped at ~2 active projects. |
| Resend | Free, $0 | ~3,000 emails/mo, ~100/day | Custom from-address needs DNS verification. Far beyond what a contact form uses. |
| Cloudflare Turnstile | Free | Very high, not literally unlimited | Recollection is a cap around 1M verifications/month. Irrelevant here, but don't quote "unlimited." |
| **Domain** | — | — | **~$10–15/year. The only guaranteed cost.** |
| Video hosting | — | — | 1GB of Supabase storage doesn't go far. Unlisted YouTube/Vimeo embeds keep you at $0. Cloudflare Stream is **$5 per 1,000 minutes stored per month, plus a delivery charge per 1,000 minutes watched** — a floor, not a flat rate. |

So: **roughly $12/year**, with the two realistic paths past that being commercial use on Vercel and self-hosted video. Both are decisions you make deliberately rather than surprises.
