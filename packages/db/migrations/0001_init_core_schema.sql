-- 0001_init_core_schema.sql
-- Core schema for Tattoo Studio MVP.
-- Idempotent. Safe to re-run.

-- =====================================================================
-- 1. Extensions
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 2. Enums
-- =====================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'artist', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_source AS ENUM (
    'web', 'whatsapp', 'manual', 'google'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- 3. Shared trigger function (updated_at)
-- =====================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 4. Tables
-- =====================================================================

-- 4.1 studios ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS studios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  timezone    text NOT NULL DEFAULT 'America/Mexico_City',
  locale      text NOT NULL DEFAULT 'es-MX',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 4.2 profiles (1:1 with auth.users) -----------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  studio_id   uuid REFERENCES studios(id) ON DELETE SET NULL,
  role        user_role NOT NULL DEFAULT 'customer',
  full_name   text,
  phone_e164  text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_studio ON profiles(studio_id);

-- 4.3 tattoo_artists ---------------------------------------------------
CREATE TABLE IF NOT EXISTS tattoo_artists (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id     uuid NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  profile_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  slug          text NOT NULL,
  display_name  text NOT NULL,
  bio           text,
  specialties   text[] NOT NULL DEFAULT '{}',
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (studio_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_tattoo_artists_studio ON tattoo_artists(studio_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_artists_profile ON tattoo_artists(profile_id);

-- 4.4 services ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id         uuid NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text,
  duration_minutes  integer NOT NULL CHECK (duration_minutes > 0),
  price_cents       integer NOT NULL CHECK (price_cents >= 0),
  currency          text NOT NULL DEFAULT 'MXN',
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_services_studio ON services(studio_id);

-- 4.5 artist_services (m:n) --------------------------------------------
CREATE TABLE IF NOT EXISTS artist_services (
  artist_id   uuid NOT NULL REFERENCES tattoo_artists(id) ON DELETE CASCADE,
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (artist_id, service_id)
);

-- 4.6 customers --------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id   uuid NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  profile_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name   text NOT NULL,
  email       text,
  phone_e164  text NOT NULL,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (studio_id, phone_e164)
);
CREATE INDEX IF NOT EXISTS idx_customers_studio ON customers(studio_id);
CREATE INDEX IF NOT EXISTS idx_customers_profile ON customers(profile_id);

-- 4.7 portfolio_items --------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id     uuid NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  artist_id     uuid NOT NULL REFERENCES tattoo_artists(id) ON DELETE CASCADE,
  storage_path  text NOT NULL,
  alt_text      text,
  style_tags    text[] NOT NULL DEFAULT '{}',
  is_published  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_artist ON portfolio_items(artist_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_studio ON portfolio_items(studio_id);

-- 4.8 appointments -----------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id       uuid NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  artist_id       uuid NOT NULL REFERENCES tattoo_artists(id) ON DELETE RESTRICT,
  service_id      uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  status          appointment_status NOT NULL DEFAULT 'pending',
  source          appointment_source NOT NULL DEFAULT 'web',
  google_event_id text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS idx_appointments_studio ON appointments(studio_id);
CREATE INDEX IF NOT EXISTS idx_appointments_artist_time ON appointments(artist_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_starts ON appointments(starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);

-- 4.9 google_oauth_tokens ---------------------------------------------
CREATE TABLE IF NOT EXISTS google_oauth_tokens (
  studio_id                uuid PRIMARY KEY REFERENCES studios(id) ON DELETE CASCADE,
  encrypted_access_token   bytea NOT NULL,
  encrypted_refresh_token  bytea NOT NULL,
  expires_at               timestamptz NOT NULL,
  scope                    text NOT NULL,
  calendar_id              text,
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- 5. updated_at triggers
-- =====================================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'studios', 'profiles', 'tattoo_artists', 'services',
    'customers', 'appointments', 'google_oauth_tokens'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_set_updated_at ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- =====================================================================
-- 6. Helper functions (auth-scoped)
-- =====================================================================
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION current_studio_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT studio_id FROM profiles WHERE id = auth.uid()
$$;

-- =====================================================================
-- 7. RLS
-- =====================================================================
ALTER TABLE studios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattoo_artists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- 7.1 studios -----------------------------------------------------------
DROP POLICY IF EXISTS studios_public_read ON studios;
CREATE POLICY studios_public_read ON studios
  FOR SELECT USING (is_active = true);

-- 7.2 profiles ----------------------------------------------------------
DROP POLICY IF EXISTS profiles_self_select ON profiles;
CREATE POLICY profiles_self_select ON profiles
  FOR SELECT USING (id = auth.uid() OR current_user_role() = 'admin');

DROP POLICY IF EXISTS profiles_self_update ON profiles;
CREATE POLICY profiles_self_update ON profiles
  FOR UPDATE USING (id = auth.uid())
                  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_admin_insert ON profiles;
CREATE POLICY profiles_admin_insert ON profiles
  FOR INSERT WITH CHECK (current_user_role() = 'admin');

DROP POLICY IF EXISTS profiles_admin_delete ON profiles;
CREATE POLICY profiles_admin_delete ON profiles
  FOR DELETE USING (current_user_role() = 'admin');

-- 7.3 tattoo_artists ----------------------------------------------------
DROP POLICY IF EXISTS artists_public_read ON tattoo_artists;
CREATE POLICY artists_public_read ON tattoo_artists
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS artists_admin_write ON tattoo_artists;
CREATE POLICY artists_admin_write ON tattoo_artists
  FOR ALL USING (current_user_role() = 'admin')
          WITH CHECK (current_user_role() = 'admin');

-- 7.4 services ---------------------------------------------------------
DROP POLICY IF EXISTS services_public_read ON services;
CREATE POLICY services_public_read ON services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS services_admin_write ON services;
CREATE POLICY services_admin_write ON services
  FOR ALL USING (current_user_role() = 'admin')
          WITH CHECK (current_user_role() = 'admin');

-- 7.5 artist_services --------------------------------------------------
DROP POLICY IF EXISTS artist_services_public_read ON artist_services;
CREATE POLICY artist_services_public_read ON artist_services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS artist_services_admin_write ON artist_services;
CREATE POLICY artist_services_admin_write ON artist_services
  FOR ALL USING (current_user_role() = 'admin')
          WITH CHECK (current_user_role() = 'admin');

-- 7.6 customers --------------------------------------------------------
DROP POLICY IF EXISTS customers_self_select ON customers;
CREATE POLICY customers_self_select ON customers
  FOR SELECT USING (
    profile_id = auth.uid()
    OR current_user_role() IN ('admin', 'artist')
  );

DROP POLICY IF EXISTS customers_self_insert ON customers;
CREATE POLICY customers_self_insert ON customers
  FOR INSERT WITH CHECK (
    profile_id IS NULL OR profile_id = auth.uid()
  );

DROP POLICY IF EXISTS customers_self_update ON customers;
CREATE POLICY customers_self_update ON customers
  FOR UPDATE USING (
    profile_id = auth.uid()
    OR current_user_role() IN ('admin', 'artist')
  );

-- 7.7 portfolio_items --------------------------------------------------
DROP POLICY IF EXISTS portfolio_public_read ON portfolio_items;
CREATE POLICY portfolio_public_read ON portfolio_items
  FOR SELECT USING (
    is_published = true
    OR current_user_role() IN ('admin', 'artist')
  );

DROP POLICY IF EXISTS portfolio_owner_write ON portfolio_items;
CREATE POLICY portfolio_owner_write ON portfolio_items
  FOR ALL USING (
    current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM tattoo_artists a
      WHERE a.id = portfolio_items.artist_id
        AND a.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM tattoo_artists a
      WHERE a.id = portfolio_items.artist_id
        AND a.profile_id = auth.uid()
    )
  );

-- 7.8 appointments -----------------------------------------------------
DROP POLICY IF EXISTS appointments_select ON appointments;
CREATE POLICY appointments_select ON appointments
  FOR SELECT USING (
    (current_user_role() = 'admin' AND studio_id = current_studio_id())
    OR (current_user_role() = 'artist' AND artist_id IN (
        SELECT id FROM tattoo_artists WHERE profile_id = auth.uid()
    ))
    OR (current_user_role() = 'customer' AND customer_id IN (
        SELECT id FROM customers WHERE profile_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS appointments_insert ON appointments;
CREATE POLICY appointments_insert ON appointments
  FOR INSERT WITH CHECK (
    current_user_role() IN ('admin', 'artist', 'customer')
  );

DROP POLICY IF EXISTS appointments_update ON appointments;
CREATE POLICY appointments_update ON appointments
  FOR UPDATE USING (
    (current_user_role() = 'admin' AND studio_id = current_studio_id())
    OR (current_user_role() = 'artist' AND artist_id IN (
        SELECT id FROM tattoo_artists WHERE profile_id = auth.uid()
    ))
  );

-- 7.9 google_oauth_tokens (server-admin only via service role) --------
DROP POLICY IF EXISTS google_tokens_admin ON google_oauth_tokens;
CREATE POLICY google_tokens_admin ON google_oauth_tokens
  FOR ALL USING (current_user_role() = 'admin')
          WITH CHECK (current_user_role() = 'admin');
