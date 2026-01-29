-- Check for duplicate senators by nombre_completo
SELECT 
    nombre_completo,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as ids,
    STRING_AGG(external_id, ', ') as external_ids
FROM parliamentarians
WHERE camara = 'senado'
GROUP BY nombre_completo
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check total senators
SELECT COUNT(*) as total_senators FROM parliamentarians WHERE camara = 'senado';

-- List all senators to see if there are obvious duplicates
SELECT id, external_id, nombre_completo, region, partido 
FROM parliamentarians 
WHERE camara = 'senado'
ORDER BY nombre_completo;
