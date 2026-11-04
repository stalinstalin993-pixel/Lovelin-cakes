-- ============================================================================
-- Pistachio & Petal — custom order reference photos (run once in SQL Editor)
-- Customers upload up to 3 resized JPEGs from the "Custom order" form without
-- signing in. Files get random names, the bucket cannot be listed by visitors,
-- and uploads are capped at 2 MB and JPEG only.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-requests',
  'custom-requests',
  true,
  2097152,
  array['image/jpeg']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can add a file to this bucket. There is deliberately no select policy,
-- so visitors cannot list or read other customers' photos. A public bucket
-- still serves each file by its direct URL, which the bakery receives on WhatsApp.
drop policy if exists "Anyone can upload custom request photos" on storage.objects;
create policy "Anyone can upload custom request photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'custom-requests');

-- Bakery staff can review and delete requests from the Supabase dashboard.
drop policy if exists "Signed-in users can manage custom request photos" on storage.objects;
create policy "Signed-in users can manage custom request photos"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'custom-requests')
  with check (bucket_id = 'custom-requests');
