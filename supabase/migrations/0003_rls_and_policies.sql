-- ============================================================
-- 0003_rls_and_policies.sql
-- RLS enabled on all 15 tables; explicit policy per table.
-- Functions first (is_admin, touch_updated_at, content_last_updated).
-- ============================================================

-- ── Functions ────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

revoke execute on function public.is_admin() from public;
grant  execute on function public.is_admin() to authenticated;

-- ── Triggers ────────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end $$;

-- attach to every table with updated_at
create trigger touch_media before update on media               for each row execute function public.touch_updated_at();
create trigger touch_documents before update on documents       for each row execute function public.touch_updated_at();
create trigger touch_copy before update on copy                 for each row execute function public.touch_updated_at();
create trigger touch_site_settings before update on site_settings for each row execute function public.touch_updated_at();
create trigger touch_sections before update on sections         for each row execute function public.touch_updated_at();
create trigger touch_projects before update on projects          for each row execute function public.touch_updated_at();
create trigger touch_experience before update on experience     for each row execute function public.touch_updated_at();
create trigger touch_tech before update on tech                 for each row execute function public.touch_updated_at();
create trigger touch_posts before update on posts               for each row execute function public.touch_updated_at();
create trigger touch_testimonials before update on testimonials for each row execute function public.touch_updated_at();
create trigger touch_nav_items before update on nav_items       for each row execute function public.touch_updated_at();
create trigger touch_admins before update on admins             for each row execute function public.touch_updated_at();
create trigger touch_contact_submissions before update on contact_submissions for each row execute function public.touch_updated_at();

-- ── Freshness stamp ──────────────────────────────────────────────────────────

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

-- ── RLS: copy ───────────────────────────────────────────────────────────────
alter table copy enable row level security;
create policy "public reads all copy"
  on copy for select to anon, authenticated using (true);
create policy "admins manage copy"
  on copy for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: site_settings ───────────────────────────────────────────────────────
alter table site_settings enable row level security;
create policy "public reads site_settings"
  on site_settings for select to anon, authenticated using (true);
create policy "admins manage site_settings"
  on site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: sections ───────────────────────────────────────────────────────────
alter table sections enable row level security;
create policy "public reads visible sections"
  on sections for select to anon, authenticated using (is_visible);
create policy "admins manage sections"
  on sections for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: nav_items ──────────────────────────────────────────────────────────
alter table nav_items enable row level security;
create policy "public reads visible nav_items"
  on nav_items for select to anon, authenticated using (is_visible);
create policy "admins manage nav_items"
  on nav_items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: media ───────────────────────────────────────────────────────────────
alter table media enable row level security;
create policy "public reads all media"
  on media for select to anon, authenticated using (true);
create policy "admins manage media"
  on media for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: documents ──────────────────────────────────────────────────────────
alter table documents enable row level security;
create policy "public reads all documents"
  on documents for select to anon, authenticated using (true);
create policy "admins manage documents"
  on documents for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: tech ───────────────────────────────────────────────────────────────
alter table tech enable row level security;
create policy "public reads all tech"
  on tech for select to anon, authenticated using (true);
create policy "admins manage tech"
  on tech for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: projects ────────────────────────────────────────────────────────────
-- 'archived' included so /archive renders — published shows in the work index.
alter table projects enable row level security;
create policy "public reads published projects"
  on projects for select to anon, authenticated
  using (status in ('published', 'archived'));
create policy "admins manage projects"
  on projects for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: experience ─────────────────────────────────────────────────────────
alter table experience enable row level security;
create policy "public reads visible experience"
  on experience for select to anon, authenticated using (is_visible);
create policy "admins manage experience"
  on experience for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: posts ─────────────────────────────────────────────────────────────
alter table posts enable row level security;
create policy "public reads published posts"
  on posts for select to anon, authenticated using (status = 'published');
create policy "admins manage posts"
  on posts for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: testimonials ───────────────────────────────────────────────────────
alter table testimonials enable row level security;
create policy "public reads visible testimonials"
  on testimonials for select to anon, authenticated using (is_visible);
create policy "admins manage testimonials"
  on testimonials for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: project_tech ──────────────────────────────────────────────────────
alter table project_tech enable row level security;
create policy "public reads all project_tech"
  on project_tech for select to anon, authenticated using (true);
create policy "admins manage project_tech"
  on project_tech for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: project_media ─────────────────────────────────────────────────────
alter table project_media enable row level security;
create policy "public reads all project_media"
  on project_media for select to anon, authenticated using (true);
create policy "admins manage project_media"
  on project_media for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── RLS: admins ─────────────────────────────────────────────────────────────
-- Select policy only — no insert/update/delete policy exists, so even an
-- authenticated admin cannot grant or revoke admin rights via the API.
-- Membership is managed by the owner in the SQL editor.
alter table admins enable row level security;
create policy "admins read admins"
  on admins for select to authenticated
  using ((select public.is_admin()));

-- ── RLS: contact_submissions ───────────────────────────────────────────────
-- anon gets NO policy at all — writes go through the service-role route handler.
alter table contact_submissions enable row level security;
create policy "admins read submissions"
  on contact_submissions for select to authenticated
  using ((select public.is_admin()));
create policy "admins update submissions"
  on contact_submissions for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
