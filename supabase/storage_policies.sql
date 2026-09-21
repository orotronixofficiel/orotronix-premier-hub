-- OROTRONIX product image storage
-- Run this once in Supabase SQL Editor after creating the orotronix-media bucket.

update storage.buckets
set public = true
where id = 'orotronix-media';

drop policy if exists "Admins can upload OROTRONIX media" on storage.objects;
create policy "Admins can upload OROTRONIX media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'orotronix-media'
  and public.is_admin()
);

drop policy if exists "Admins can update OROTRONIX media" on storage.objects;
create policy "Admins can update OROTRONIX media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'orotronix-media'
  and public.is_admin()
)
with check (
  bucket_id = 'orotronix-media'
  and public.is_admin()
);

drop policy if exists "Admins can delete OROTRONIX media" on storage.objects;
create policy "Admins can delete OROTRONIX media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'orotronix-media'
  and public.is_admin()
);
