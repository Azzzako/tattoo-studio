-- 0012_relax_portfolio_paths.sql
-- Permite portfolios sin storage_path real (usa ImagePlaceholder con seed)
-- y siembra 6 items por tatuador seedeado para que la galeria se vea
-- poblada en dev. Idempotente.

-- =====================================================================
-- 1. storage_path pasa a ser opcional; anade seed
-- =====================================================================
ALTER TABLE portfolio_items
  ALTER COLUMN storage_path DROP NOT NULL;

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS seed text;

-- =====================================================================
-- 2. Seed de items de portafolio para inka/mara/yael
-- =====================================================================

DO $$
DECLARE
  studio uuid := '00000000-0000-0000-0000-000000000001';
  inka_id uuid;
  mara_id uuid;
  yael_id uuid;
  i int;
  item_id uuid;
BEGIN
  SELECT id INTO inka_id FROM tattoo_artists WHERE studio_id = studio AND slug = 'inka';
  SELECT id INTO mara_id FROM tattoo_artists WHERE studio_id = studio AND slug = 'mara';
  SELECT id INTO yael_id FROM tattoo_artists WHERE studio_id = studio AND slug = 'yael';

  -- 6 items: inka
  IF inka_id IS NOT NULL THEN
    FOR i IN 1..6 LOOP
      item_id := gen_random_uuid();
      INSERT INTO portfolio_items (id, studio_id, artist_id, storage_path, seed, alt_text, style_tags, is_published)
      VALUES (
        item_id,
        studio,
        inka_id,
        NULL,
        'inka-' || i::text,
        'Trabajo ' || i::text || ' de Inka',
        ARRAY['blackwork', 'geometry']::text[],
        true
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  -- 4 items: mara
  IF mara_id IS NOT NULL THEN
    FOR i IN 1..4 LOOP
      item_id := gen_random_uuid();
      INSERT INTO portfolio_items (id, studio_id, artist_id, storage_path, seed, alt_text, style_tags, is_published)
      VALUES (
        item_id,
        studio,
        mara_id,
        NULL,
        'mara-' || i::text,
        'Trabajo ' || i::text || ' de Mara',
        ARRAY['fineline', 'watercolor']::text[],
        true
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  -- 3 items: yael
  IF yael_id IS NOT NULL THEN
    FOR i IN 1..3 LOOP
      item_id := gen_random_uuid();
      INSERT INTO portfolio_items (id, studio_id, artist_id, storage_path, seed, alt_text, style_tags, is_published)
      VALUES (
        item_id,
        studio,
        yael_id,
        NULL,
        'yael-' || i::text,
        'Trabajo ' || i::text || ' de Yael',
        ARRAY['realism', 'portrait']::text[],
        true
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;
END $$;
