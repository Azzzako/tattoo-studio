-- 0007_seed_dev_appointments.sql
-- Sample appointments distribuidas en los proximos 14 dias para que el
-- dashboard tenga contenido representativo. Idempotente por id fijo.

-- Duraciones canonicas (de services.seed 0002):
--   Consulta      = 15 min
--   Tattoo pequeño= 60 min
--   Tattoo mediano= 120 min
--   Tattoo grande= 180 min
--   Cover-up      = 180 min

INSERT INTO appointments (id, studio_id, artist_id, service_id, customer_id, starts_at, ends_at, status, source, notes)
VALUES
  -- Pasada confirmada (ayer) — INKA + Sofía
  (
    '22000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000022',
    '11000000-0000-0000-0000-000000000003',
    now() - interval '1 day' + interval '11 hours',
    now() - interval '1 day' + interval '13 hours',
    'completed',
    'web',
    NULL
  ),
  -- Hoy: Consulta confirmada
  (
    '22000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000020',
    '11000000-0000-0000-0000-000000000004',
    now() + interval '3 hours',
    now() + interval '3 hours 15 minutes',
    'confirmed',
    'whatsapp',
    'Trae referencia en el celular.'
  ),
  -- Mañana: Tattoo pequeño pendiente
  (
    '22000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000021',
    '11000000-0000-0000-0000-000000000005',
    now() + interval '1 day 6 hours',
    now() + interval '1 day 7 hours',
    'pending',
    'web',
    NULL
  ),
  -- En 3 dias: Tattoo mediano confirmado
  (
    '22000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000022',
    '11000000-0000-0000-0000-000000000001',
    now() + interval '3 days 10 hours',
    now() + interval '3 days 12 hours',
    'confirmed',
    'manual',
    NULL
  ),
  -- En 5 dias: Cover-up confirmado
  (
    '22000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000024',
    '11000000-0000-0000-0000-000000000002',
    now() + interval '5 days 14 hours',
    now() + interval '5 days 17 hours',
    'confirmed',
    'web',
    'Depósito recibido.'
  ),
  -- En 8 dias: Tattoo grande pendiente
  (
    '22000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000023',
    '11000000-0000-0000-0000-000000000003',
    now() + interval '8 days 9 hours',
    now() + interval '8 days 12 hours',
    'pending',
    'whatsapp',
    'Quiere cotización final.'
  )
ON CONFLICT (id) DO NOTHING;
