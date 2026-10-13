-- ============================================================
-- 0004_storage.sql
-- Storage buckets and object policies.
-- ============================================================

-- Create buckets (id = name for simplicity; both must be unique together).
insert into storage.buckets (id, name, public)
values ('media', 'media', true), ('documents', 'documents', true)
on conflict (id) do nothing;

-- ── media bucket ─────────────────────────────────────────────────────────────
-- public read is always on; no policy needed for reads.
create policy "admins insert media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and (select public.is_admin())
  );

create policy "admins update media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'media'
    and (select public.is_admin())
  );

create policy "admins delete media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'media'
    and (select public.is_admin())
  );

-- ── documents bucket ─────────────────────────────────────────────────────────
create policy "admins insert documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (select public.is_admin())
  );

create policy "admins update documents"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'documents'
    and (select public.is_admin())
  );

create policy "admins delete documents"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and (select public.is_admin())
  );
