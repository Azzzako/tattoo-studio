-- 0008_artist_profile_fields.sql
-- Anade columnas sociales a tattoo_artists, RLS policy de auto-update,
-- bucket de storage para avatars. Idempotente.

-- =====================================================================
-- 1. Columns
-- =====================================================================
ALTER TABLE tattoo_artists
  ADD COLUMN IF NOT EXISTS avatar_path    text,
  ADD COLUMN IF NOT EXISTS instagram      text,
  ADD COLUMN IF NOT EXISTS twitter        text,
  ADD COLUMN IF NOT EXISTS youtube        text,
  ADD COLUMN IF NOT EXISTS website        text;

-- =====================================================================
-- 2. RLS: artists can update their own row (bio, display_name, social,
--    avatar_path, specialties). Slug/studio_id/profile_id/is_active
--    quedan protegidos por no formar parte del payload de update.
-- =====================================================================
DROP POLICY IF EXISTS artists_self_update ON tattoo_artists;
CREATE POLICY artists_self_update ON tattoo_artists
  FOR UPDATE USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- =====================================================================
-- 3. Storage bucket: artist-avatars (public read, 5 MB, jpeg/png/webp)
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artist-avatars',
  'artist-avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 4. Storage RLS: artists can upload/update/delete their own avatar.
--    Path convention: {studio_id}/{artist_id}/{filename}.
-- =====================================================================
DROP POLICY IF EXISTS "artists-avatar-insert" ON storage.objects;
CREATE POLICY "artists-avatar-insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'artist-avatars'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM tattoo_artists WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "artists-avatar-update" ON storage.objects;
CREATE POLICY "artists-avatar-update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'artist-avatars'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM tattoo_artists WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "artists-avatar-delete" ON storage.objects;
CREATE POLICY "artists-avatar-delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'artist-avatars'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM tattoo_artists WHERE profile_id = auth.uid()
    )
  );
