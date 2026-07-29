-- 0006_seed_dev_customers.sql
-- Sample customers para que el calendario del dashboard tenga datos
-- representativos. Idempotente.

INSERT INTO customers (id, studio_id, full_name, email, phone_e164, notes)
VALUES
  (
    '11000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Ana García',
    'ana.garcia@example.com',
    '+525551110001',
    NULL
  ),
  (
    '11000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Luis Martínez',
    'luis.martinez@example.com',
    '+525551110002',
    'Consulta previa por WhatsApp.'
  ),
  (
    '11000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Sofía López',
    'sofia.lopez@example.com',
    '+525551110003',
    NULL
  ),
  (
    '11000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Diego Ramírez',
    'diego.ramirez@example.com',
    '+525551110004',
    NULL
  ),
  (
    '11000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Mariana Cruz',
    'mariana.cruz@example.com',
    '+525551110005',
    'Cliente frecuente.'
  )
ON CONFLICT (studio_id, phone_e164) DO NOTHING;
