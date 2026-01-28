-- Script de verificación: Ejecuta esto en Supabase SQL Editor
-- para confirmar que las tablas están creadas correctamente

-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('parliamentarians', 'bills', 'bill_events', 'votes', 'vote_roll_call')
ORDER BY table_name;

-- Verificar estructura de la tabla parliamentarians
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'parliamentarians'
ORDER BY ordinal_position;

-- Verificar estructura de la tabla bills
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bills'
ORDER BY ordinal_position;

-- Contar registros actuales (debería ser 0 si es nuevo)
SELECT 
  'parliamentarians' as tabla, COUNT(*) as registros FROM parliamentarians
UNION ALL
SELECT 'bills', COUNT(*) FROM bills
UNION ALL
SELECT 'bill_events', COUNT(*) FROM bill_events
UNION ALL
SELECT 'votes', COUNT(*) FROM votes
UNION ALL
SELECT 'vote_roll_call', COUNT(*) FROM vote_roll_call;
