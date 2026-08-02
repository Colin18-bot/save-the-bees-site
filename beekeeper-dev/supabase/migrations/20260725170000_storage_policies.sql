-- Public read
create policy "Public read photos"
on storage.objects
for select
using (
  bucket_id = 'photos'
);

-- Users manage their own uploaded photos
create policy "Users can manage own photos"
on storage.objects
for all
using (
  bucket_id = 'photos'
  and auth.role() = 'authenticated'
  and owner = auth.uid()
);

-- Avatar update
create policy "avatar-update-own-folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'photos'
  and name like ('avatar/' || auth.uid() || '/%')
  and owner = auth.uid()
)
with check (
  bucket_id = 'photos'
  and name like ('avatar/' || auth.uid() || '/%')
  and owner = auth.uid()
);

-- Avatar delete
create policy "photos_delete_own_avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = 'avatar'
  and split_part(name, '/', 2) like (auth.uid() || '.%')
);

-- Avatar modify
create policy "photos_modify_own_avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = 'avatar'
  and split_part(name, '/', 2) like (auth.uid() || '.%')
)
with check (
  bucket_id = 'photos'
);

-- Avatar upload
create policy "photos_write_own_avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = 'avatar'
  and split_part(name, '/', 2) like (auth.uid() || '.%')
);