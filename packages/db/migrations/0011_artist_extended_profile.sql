-- 0011_artist_extended_profile.sql
-- Anade campos completos para que /tatuadores/[slug] sea 100% DB-driven:
--   city, years_active, schedule_kind, schedule_weeks, headline, long_bio,
--   featured. Idempotente.

-- =====================================================================
-- 1. Enum: tipo de agenda
-- =====================================================================
DO $$ BEGIN
  CREATE TYPE schedule_kind AS ENUM (
    'open_now',
    'closes_in_weeks',
    'waitlist_only',
    'by_request'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- 2. Columnas en tattoo_artists
-- =====================================================================
ALTER TABLE tattoo_artists
  ADD COLUMN IF NOT EXISTS city              text,
  ADD COLUMN IF NOT EXISTS years_active      integer CHECK (years_active IS NULL OR years_active BETWEEN 0 AND 80),
  ADD COLUMN IF NOT EXISTS schedule_kind     schedule_kind,
  ADD COLUMN IF NOT EXISTS schedule_weeks    integer CHECK (schedule_weeks IS NULL OR schedule_weeks BETWEEN 1 AND 52),
  ADD COLUMN IF NOT EXISTS headline          text,
  ADD COLUMN IF NOT EXISTS long_bio          text,
  ADD COLUMN IF NOT EXISTS featured          boolean NOT NULL DEFAULT false;

-- =====================================================================
-- 3. Backfill idempotente para tatuadores seedeados (slugs definitivos).
--     Si ya tienen valor, no se sobreescribe (preserva ediciones del
--     artista via /cuenta/perfil).
-- =====================================================================

-- inka
UPDATE tattoo_artists SET
  city           = COALESCE(city,           'Ciudad de México'),
  years_active   = COALESCE(years_active,   7),
  schedule_kind  = COALESCE(schedule_kind,  'closes_in_weeks'::schedule_kind),
  schedule_weeks = COALESCE(schedule_weeks, 3),
  headline       = COALESCE(headline,       'Geometría con intención.'),
  long_bio       = COALESCE(long_bio,       'Inka descubrió el tatuaje mientras estudiaba arquitectura. Esa formación se nota en cada pieza: precisión milimétrica, composición limpia y respeto por los ritmos naturales del cuerpo. Su trabajo se mueve entre la geometría sagrada, el blackwork denso y las composiciones contemporáneas que dialogan con el espacio negativo.'),
  featured       = featured OR slug = 'inka'
WHERE studio_id = '00000000-0000-0000-0000-000000000001' AND slug = 'inka';

-- mara
UPDATE tattoo_artists SET
  city           = COALESCE(city,           'Ciudad de México'),
  years_active   = COALESCE(years_active,   5),
  schedule_kind  = COALESCE(schedule_kind,  'open_now'::schedule_kind),
  headline       = COALESCE(headline,       'Acuarela que respira.'),
  long_bio       = COALESCE(long_bio,       'Mara viene del mundo de la ilustración botánica. Eso se traduce en tatuajes con líneas finas, vibrantes pero contenidas, donde cada color respira. Trabaja especialmente composiciones inspiradas en flora y fauna local.'),
  featured       = featured OR slug = 'mara'
WHERE studio_id = '00000000-0000-0000-0000-000000000001' AND slug = 'mara';

-- yael
UPDATE tattoo_artists SET
  city           = COALESCE(city,           'Ciudad de México'),
  years_active   = COALESCE(years_active,   9),
  schedule_kind  = COALESCE(schedule_kind,  'waitlist_only'::schedule_kind),
  headline       = COALESCE(headline,       'Retratos sobre piel.'),
  long_bio       = COALESCE(long_bio,       'Yael lleva casi una década tatuando retratos que respiran. Su trabajo es técnico, paciente y profundamente humano: cada pieza es una conversación que puede durar meses antes de tocar la piel.'),
  featured       = featured OR slug = 'yael'
WHERE studio_id = '00000000-0000-0000-0000-000000000001' AND slug = 'yael';
