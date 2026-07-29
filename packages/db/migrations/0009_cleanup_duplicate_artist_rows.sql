-- 0009_cleanup_duplicate_artist_rows.sql
-- Asegura que cada profile_id (no nulo) este vinculado a UNA SOLA fila de
-- tattoo_artists. Borra duplicados quedandose con la fila mas reciente.
-- Idempotente.

DELETE FROM tattoo_artists a
WHERE profile_id IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT ON (profile_id) id
    FROM tattoo_artists
    WHERE profile_id IS NOT NULL
    ORDER BY profile_id, updated_at DESC, id
  );
