-- 0014_quotes.sql
-- Tablas quotes + quote_attachments con RLS. Idempotente.

-- =====================================================================
-- 1. quotes
-- =====================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id         uuid NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  artist_id         uuid REFERENCES tattoo_artists(id) ON DELETE SET NULL,
  customer_name     text NOT NULL,
  customer_phone    text NOT NULL,
  customer_email    text,
  idea_text         text NOT NULL,
  budget_cents      integer CHECK (budget_cents IS NULL OR budget_cents >= 0),
  status            text NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('sent', 'read', 'archived')),
  source            text NOT NULL DEFAULT 'web',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_studio_created
  ON quotes(studio_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotes_artist_created
  ON quotes(artist_id, created_at DESC)
  WHERE artist_id IS NOT NULL;

-- =====================================================================
-- 2. quote_attachments
-- =====================================================================
CREATE TABLE IF NOT EXISTS quote_attachments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id      uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  storage_path  text NOT NULL,
  mime_type     text NOT NULL,
  size_bytes    integer NOT NULL CHECK (size_bytes > 0),
  position      integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_attachments_quote_position
  ON quote_attachments(quote_id, position);

-- =====================================================================
-- 3. updated_at trigger
-- =====================================================================
DROP TRIGGER IF EXISTS trg_quotes_set_updated_at ON quotes;
CREATE TRIGGER trg_quotes_set_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 4. RLS
-- =====================================================================
ALTER TABLE quotes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_attachments ENABLE ROW LEVEL SECURITY;

-- quotes: admin del estudio ve todo
DROP POLICY IF EXISTS quotes_admin_select ON quotes;
CREATE POLICY quotes_admin_select ON quotes
  FOR SELECT TO authenticated
  USING (
    current_user_role() = 'admin' AND studio_id = current_studio_id()
  );

-- quotes: artista ve solo las suyas
DROP POLICY IF EXISTS quotes_artist_select ON quotes;
CREATE POLICY quotes_artist_select ON quotes
  FOR SELECT TO authenticated
  USING (
    artist_id IN (
      SELECT id FROM tattoo_artists WHERE profile_id = auth.uid()
    )
  );

-- quotes: admin puede actualizar estado (read/archived)
DROP POLICY IF EXISTS quotes_admin_update ON quotes;
CREATE POLICY quotes_admin_update ON quotes
  FOR UPDATE TO authenticated
  USING (current_user_role() = 'admin' AND studio_id = current_studio_id())
  WITH CHECK (current_user_role() = 'admin' AND studio_id = current_studio_id());

-- quote_attachments: visible si la quote es visible para el usuario
DROP POLICY IF EXISTS quote_attachments_select ON quote_attachments;
CREATE POLICY quote_attachments_select ON quote_attachments
  FOR SELECT TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes
      WHERE
        (current_user_role() = 'admin' AND studio_id = current_studio_id())
        OR (artist_id IN (
          SELECT id FROM tattoo_artists WHERE profile_id = auth.uid()
        ))
    )
  );

-- Inserciones de quotes y quote_attachments se hacen via service role
-- (bypass RLS) desde route handlers / server actions; no exponemos policies
-- publicas para evitar abuse.