-- 0004_seed.sql
-- Seed one demo studio, a superadmin, two artists, services, availability, portfolio and event.

insert into studios (id, name, slug, timezone, locale, description)
values (
  '00000000-0000-0000-0000-000000000001',
  'Tattoo Studio Demo',
  'tattoo-studio',
  'America/Mexico_City',
  'es-MX',
  'Estudio piloto para validar la plataforma.'
)
on conflict (id) do nothing;

insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
values (
  '11111111-1111-1111-1111-111111111111',
  'admin@admin.com',
  jsonb_build_object('full_name', 'Super Admin'),
  crypt('change-me', gen_salt('bf')),
  now()
)
on conflict (id) do nothing;

insert into user_profiles (user_id, studio_id, full_name, display_name, locale)
values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Super Admin',
  'Super Admin',
  'es-MX'
)
on conflict (user_id) do nothing;

insert into studio_memberships (studio_id, user_id, role, status)
values (
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'platform_superadmin',
  'active'
)
on conflict do nothing;

insert into artist_profiles (id, studio_id, user_id, slug, display_name, bio, styles, experience_years, is_active, is_public)
values
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'inka',
    'Inka',
    'Especialista en blackwork y dotwork.',
    array['blackwork','dotwork'],
    8,
    true,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    null,
    'mara',
    'Mara',
    'Color y acuarela con líneas finas.',
    array['color','fine-line'],
    5,
    true,
    true
  )
on conflict do nothing;

insert into social_links (artist_id, network, url, sort_order)
values
  ('22222222-2222-2222-2222-222222222222', 'instagram', 'https://instagram.com/inka', 0),
  ('33333333-3333-3333-3333-333333333333', 'instagram', 'https://instagram.com/mara', 0)
on conflict do nothing;

insert into services (id, studio_id, artist_id, name, description, duration_minutes, price_cents, is_active)
values
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Consulta',
    'Diseño y propuesta inicial.',
    30,
    5000,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Sesión corta',
    'Tatuajes pequeños.',
    90,
    25000,
    true
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'Sesión larga',
    'Piezas medianas o grandes.',
    180,
    60000,
    true
  )
on conflict do nothing;

insert into availability_rules (artist_id, weekday, starts_at, ends_at, effective_from)
values
  ('22222222-2222-2222-2222-222222222222', 'tue', '11:00', '19:00', current_date),
  ('22222222-2222-2222-2222-222222222222', 'wed', '11:00', '19:00', current_date),
  ('22222222-2222-2222-2222-222222222222', 'thu', '11:00', '19:00', current_date),
  ('22222222-2222-2222-2222-222222222222', 'fri', '11:00', '19:00', current_date),
  ('22222222-2222-2222-2222-222222222222', 'sat', '12:00', '18:00', current_date),
  ('33333333-3333-3333-3333-333333333333', 'mon', '10:00', '18:00', current_date),
  ('33333333-3333-3333-3333-333333333333', 'wed', '10:00', '18:00', current_date),
  ('33333333-3333-3333-3333-333333333333', 'fri', '10:00', '18:00', current_date)
on conflict do nothing;

insert into portfolio_items (id, studio_id, artist_id, title, body_zone, style, is_featured, is_public, published_at)
values
  (
    '77777777-7777-7777-7777-777777777777',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Geometría braquial',
    'brazo',
    'blackwork',
    true,
    true,
    now()
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'Acuarela floral',
    'espalda',
    'color',
    true,
    true,
    now()
  )
on conflict do nothing;

insert into events (id, studio_id, title, slug, description, location, city, country, starts_at, ends_at, is_published)
values
  (
    '99999999-9999-9999-9999-999999999999',
    '00000000-0000-0000-0000-000000000001',
    'Convención Tinta 2026',
    'convencion-tinta-2026',
    'Convención anual de tatuadores.',
    'Centro de Convenciones',
    'CDMX',
    'México',
    now() + interval '30 days',
    now() + interval '32 days',
    true
  )
on conflict do nothing;

insert into event_artists (event_id, artist_id)
values
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222'),
  ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333')
on conflict do nothing;