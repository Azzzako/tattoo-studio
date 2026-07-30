-- 0015_quote_attachments_bucket.sql
-- Bucket publico para imagenes de cotizacion. 8 MB max. jpeg/png/webp.
-- Path convention: {studio_id}/{quote_id}/{n}.{ext}.
-- Idempotente.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-attachments',
  'quote-attachments',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;