-- 0005_align_artist_slugs.sql
-- Renombra los slugs seedeados en 0002 (mateo/lucia/raul) para que coincidan
-- con los slugs que las paginas publicas hardcodean actualmente
-- (inka/mara/yael). Asi el link del header `/tatuadores/inka/reservar`
-- deja de tirar 404.
--
-- Idempotente: si los slugs ya fueron cambiados, ON CONFLICT deja las
-- restantes igual. Si los artistas del seed fueron borrados manualmente,
-- no-op.

-- 1. Limpia slugs viejos para liberar unique (studio_id, slug) constraint.
DO $$
DECLARE
  m record;
  l record;
  r record;
BEGIN
  -- mateo -> inka
  SELECT id, slug, display_name, bio INTO m FROM tattoo_artists
    WHERE studio_id = '00000000-0000-0000-0000-000000000001' AND slug = 'mateo';
  IF m.id IS NOT NULL THEN
    UPDATE tattoo_artists
      SET slug = 'inka',
          display_name = COALESCE(NULLIF(m.display_name, 'Mateo Reyes'), m.display_name),
          bio          = COALESCE(NULLIF(m.bio, ''), m.bio)
      WHERE id = m.id;
  END IF;

  -- lucia -> mara
  SELECT id, slug, display_name, bio INTO l FROM tattoo_artists
    WHERE studio_id = '00000000-0000-0000-0000-000000000001' AND slug = 'lucia';
  IF l.id IS NOT NULL THEN
    UPDATE tattoo_artists
      SET slug = 'mara',
          display_name = COALESCE(NULLIF(l.display_name, 'Lucía Vargas'), l.display_name),
          bio          = COALESCE(NULLIF(l.bio, ''), l.bio)
      WHERE id = l.id;
  END IF;

  -- raul -> yael
  SELECT id, slug, display_name, bio INTO r FROM tattoo_artists
    WHERE studio_id = '00000000-0000-0000-0000-000000000001' AND slug = 'raul';
  IF r.id IS NOT NULL THEN
    UPDATE tattoo_artists
      SET slug = 'yael',
          display_name = COALESCE(NULLIF(r.display_name, 'Raúl Mendoza'), r.display_name),
          bio          = COALESCE(NULLIF(r.bio, ''), r.bio)
      WHERE id = r.id;
  END IF;
END $$;

-- 2. Si el seed 0002 vuelve a correr despues de esta migracion, los slugs
--    inka/mara/yael ya existen y el ON CONFLICT del seed no los duplica.
