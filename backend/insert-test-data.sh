#!/bin/bash

# Script para insertar datos de prueba en la base de datos

docker exec gastosfamilia-db psql -U gastosfamilia -d gastosfamilia -c "
-- Insertar gastos de prueba (últimos 7 días)
INSERT INTO expenses (tenant_id, amount, description, category_id, payment_method, created_at)
SELECT 
  (SELECT tenant_id FROM users WHERE email = 'david@gastos-familia.com' LIMIT 1),
  ROUND((RANDOM() * 100 + 10)::numeric, 2),
  'Gasto ' || to_char(CURRENT_TIMESTAMP - (INTERVAL '1 day' * n), 'DD MMM'),
  NULL,
  'tarjeta',
  CURRENT_TIMESTAMP - (INTERVAL '1 day' * n)
FROM generate_series(0, 6) as t(n)
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE created_at::date = CURRENT_DATE - n);

-- Insertar gastos recurrentes
INSERT INTO recurring_expenses (tenant_id, amount, description, frequency, next_date, is_active)
VALUES
  ((SELECT tenant_id FROM users WHERE email = 'david@gastos-familia.com' LIMIT 1), 17.99, 'Netflix', 'monthly', CURRENT_DATE + INTERVAL '5 days', true),
  ((SELECT tenant_id FROM users WHERE email = 'david@gastos-familia.com' LIMIT 1), 10.99, 'Spotify', 'monthly', CURRENT_DATE + INTERVAL '6 days', true),
  ((SELECT tenant_id FROM users WHERE email = 'david@gastos-familia.com' LIMIT 1), 85.00, 'Electricidad', 'monthly', CURRENT_DATE + INTERVAL '8 days', true),
  ((SELECT tenant_id FROM users WHERE email = 'david@gastos-familia.com' LIMIT 1), 45.50, 'Internet', 'monthly', CURRENT_DATE + INTERVAL '9 days', true),
  ((SELECT tenant_id FROM users WHERE email = 'david@gastos-familia.com' LIMIT 1), 120.00, 'Gym', 'monthly', CURRENT_DATE + INTERVAL '12 days', true)
ON CONFLICT DO NOTHING;

SELECT 'Datos insertados correctamente' as status;
"
