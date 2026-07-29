-- 0010_unique_artist_profile.sql
-- Restringe: como maximo una fila de tattoo_artists por profile_id no nulo.
-- Evita que el bug que causo la fila zombie se repita.

CREATE UNIQUE INDEX IF NOT EXISTS uq_tattoo_artists_profile_id
  ON tattoo_artists(profile_id)
  WHERE profile_id IS NOT NULL;
