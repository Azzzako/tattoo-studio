-- 0002_seed_dev_studio.sql
-- Development seed: 1 studio, 3 artists, 5 services.
-- Idempotent (re-runnable). All ids hardcoded for reproducibility.

-- =====================================================================
-- Helper: ensure unique constraint for idempotent service inserts.
-- A production-grade uniqueness column (slug) will live on services
-- once 0003 introduces it. Until then, this unique index is enough.
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_services_studio_name
  ON services(studio_id, name);

-- =====================================================================
-- 1. Studio (id matches STUDIO_ID in .env)
-- =====================================================================
INSERT INTO studios (id, slug, name, timezone, locale, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'default',
  'Tattoo Studio Demo',
  'America/Mexico_City',
  'es-MX',
  true
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 2. Artists
-- =====================================================================
INSERT INTO tattoo_artists (id, studio_id, slug, display_name, bio, specialties, is_active)
VALUES
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'mateo',
    'Mateo Reyes',
    'Especialista en blackwork y geometría sagrada.',
    ARRAY['blackwork', 'geometry', 'dotwork'],
    true
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    'lucia',
    'Lucía Vargas',
    'Fine line, lettering y minimalismo.',
    ARRAY['fineline', 'lettering', 'minimal'],
    true
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    'raul',
    'Raúl Mendoza',
    'Tradicional americano y realism.',
    ARRAY['traditional', 'realism', 'color'],
    true
  )
ON CONFLICT (studio_id, slug) DO NOTHING;

-- =====================================================================
-- 3. Services
-- =====================================================================
INSERT INTO services (id, studio_id, name, description, duration_minutes, price_cents, currency, is_active)
VALUES
  (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000001',
    'Consulta',
    'Sesión de evaluación y diseño inicial.',
    15,
    0,
    'MXN',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000001',
    'Tattoo pequeño',
    'Hasta 5cm de lado.',
    60,
    80000,
    'MXN',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000001',
    'Tattoo mediano',
    'Entre 5cm y 15cm.',
    120,
    150000,
    'MXN',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-000000000001',
    'Tattoo grande',
    'Más de 15cm. Cotización previa.',
    180,
    250000,
    'MXN',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000024',
    '00000000-0000-0000-0000-000000000001',
    'Cover-up',
    'Cubrimiento de tattoo previo. Cotización por diseño.',
    180,
    300000,
    'MXN',
    true
  )
ON CONFLICT (studio_id, name) DO NOTHING;

-- =====================================================================
-- 4. artist_services: each artist offers each service
-- =====================================================================
INSERT INTO artist_services (artist_id, service_id)
SELECT a.id, s.id
FROM tattoo_artists a
CROSS JOIN services s
WHERE a.studio_id = '00000000-0000-0000-0000-000000000001'
  AND s.studio_id  = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;
