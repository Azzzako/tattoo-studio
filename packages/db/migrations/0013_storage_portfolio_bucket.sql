-- 0013_storage_portfolio_bucket.sql
-- Bucket publico artist-portfolio. 8 MB max. jpeg/png/webp.
-- Path convention: {studio_id}/{artist_id}/{filename}.
-- Idempotente.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artist-portfolio',
  'artist-portfolio',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "artists-portfolio-insert" ON storage.objects;
CREATE POLICY "artists-portfolio-insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'artist-portfolio'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM tattoo_artists WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "artists-portfolio-update" ON storage.objects;
CREATE POLICY "artists-portfolio-update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'artist-portfolio'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM tattoo_artists WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "artists-portfolio-delete" ON storage.objects;
CREATE POLICY "artists-portfolio-delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'artist-portfolio'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM tattoo_artists WHERE profile_id = auth.uid()
    )
  );
