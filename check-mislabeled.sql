-- Diagnostic: Check if there are deputies mislabeled as senators
-- This checks if any records marked as 'senado' have DIPID instead of SENID

SELECT 
    camara,
    external_id,
    nombre_completo,
    region,
    partido
FROM parliamentarians
WHERE camara = 'senado'
  AND (
    external_id LIKE 'DIP%' 
    OR id LIKE 'DIP%'
  )
ORDER BY nombre_completo;

-- Count total by chamber
SELECT camara, COUNT(*) as total
FROM parliamentarians
GROUP BY camara;

-- Check for true duplicates (same name, same chamber)
SELECT 
    nombre_completo,
    camara,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as ids
FROM parliamentarians
GROUP BY nombre_completo, camara
HAVING COUNT(*) > 1;
