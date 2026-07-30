-- 0017_api_keys.sql
-- Tabla para API keys (Bearer token) que clientes externos usan para
-- consumir /api/v1/*. El server compara SHA-256 del token con `hash`.
-- Solo lectura (read:artists) en MVP.
-- Idempotente.

-- =====================================================================
-- 1. Tabla
-- =====================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id     uuid NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name          text NOT NULL,
  prefix        text NOT NULL,
  hash          text NOT NULL,
  scopes        text[] NOT NULL DEFAULT ARRAY['read:artists']::text[],
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz,
  UNIQUE (prefix, hash)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_studio ON api_keys(studio_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);

-- =====================================================================
-- 2. updated_at trigger (compartido con set_updated_at)
-- =====================================================================
DROP TRIGGER IF EXISTS trg_api_keys_set_updated_at ON api_keys;
CREATE TRIGGER trg_api_keys_set_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 3. RLS: solo service-role (backend valida con auth.ts).
-- =====================================================================
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- No hay policies publicas. El servicio valida las keys via admin client.
-- Si necesitas auditar/revocar, hace falta una vista admin (futura iter).