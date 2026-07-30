-- 0016_artist_profile_changes.sql
-- Cola de cambios propuestos por artistas al admin. Admin revisa
-- (approve/reject) y aplica al artist row.
-- Idempotente.

-- =====================================================================
-- 1. Tabla
-- =====================================================================
CREATE TABLE IF NOT EXISTS artist_profile_changes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id         uuid NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  artist_id         uuid NOT NULL REFERENCES tattoo_artists(id) ON DELETE CASCADE,
  proposed_changes  jsonb NOT NULL,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at       timestamptz,
  review_note       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apc_studio_status_created
  ON artist_profile_changes(studio_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_apc_artist_status
  ON artist_profile_changes(artist_id, status);

-- =====================================================================
-- 2. updated_at trigger
-- =====================================================================
DROP TRIGGER IF EXISTS trg_apc_set_updated_at ON artist_profile_changes;
CREATE TRIGGER trg_apc_set_updated_at
  BEFORE UPDATE ON artist_profile_changes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 3. RLS
-- =====================================================================
ALTER TABLE artist_profile_changes ENABLE ROW LEVEL SECURITY;

-- Artist: insertar propuestas para su propia fila, leer sus propias.
DROP POLICY IF EXISTS apc_artist_insert ON artist_profile_changes;
CREATE POLICY apc_artist_insert ON artist_profile_changes
  FOR INSERT TO authenticated
  WITH CHECK (
    artist_id IN (SELECT id FROM tattoo_artists WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS apc_artist_select ON artist_profile_changes;
CREATE POLICY apc_artist_select ON artist_profile_changes
  FOR SELECT TO authenticated
  USING (
    artist_id IN (SELECT id FROM tattoo_artists WHERE profile_id = auth.uid())
  );

-- Admin del estudio: ve todas las propuestas y puede actualizar el status.
DROP POLICY IF EXISTS apc_admin_select ON artist_profile_changes;
CREATE POLICY apc_admin_select ON artist_profile_changes
  FOR SELECT TO authenticated
  USING (
    current_user_role() = 'admin' AND studio_id = current_studio_id()
  );

DROP POLICY IF EXISTS apc_admin_update ON artist_profile_changes;
CREATE POLICY apc_admin_update ON artist_profile_changes
  FOR UPDATE TO authenticated
  USING (current_user_role() = 'admin' AND studio_id = current_studio_id())
  WITH CHECK (current_user_role() = 'admin' AND studio_id = current_studio_id());