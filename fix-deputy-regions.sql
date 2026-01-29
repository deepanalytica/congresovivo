-- Fix deputy regions by inferring from distrito field
-- This updates all deputies to have the correct region based on their electoral district

UPDATE parliamentarians
SET region = CASE distrito
    WHEN 1 THEN 'Arica y Parinacota'
    WHEN 2 THEN 'Tarapacá'
    WHEN 3 THEN 'Antofagasta'
    WHEN 4 THEN 'Antofagasta'
    WHEN 5 THEN 'Atacama'
    WHEN 6 THEN 'Coquimbo'
    WHEN 7 THEN 'Valparaíso'
    WHEN 8 THEN 'Valparaíso'
    WHEN 9 THEN 'Metropolitana'
    WHEN 10 THEN 'Metropolitana'
    WHEN 11 THEN 'Metropolitana'
    WHEN 12 THEN 'Metropolitana'
    WHEN 13 THEN 'Metropolitana'
    WHEN 14 THEN 'Metropolitana'
    WHEN 15 THEN 'Metropolitana'
    WHEN 16 THEN 'Metropolitana'
    WHEN 17 THEN "O'Higgins"
    WHEN 18 THEN 'Maule'
    WHEN 19 THEN 'Maule'
    WHEN 20 THEN 'Ñuble'
    WHEN 21 THEN 'Biobío'
    WHEN 22 THEN 'Biobío'
    WHEN 23 THEN 'Biobío'
    WHEN 24 THEN 'Araucanía'
    WHEN 25 THEN 'Araucanía'
    WHEN 26 THEN 'Los Ríos'
    WHEN 27 THEN 'Los Lagos'
    WHEN 28 THEN 'Los Lagos'
    WHEN 29 THEN 'Aysén'
    WHEN 30 THEN 'Magallanes'
    ELSE region -- Keep existing region if distrito doesn't match
END
WHERE camara = 'camara' AND distrito IS NOT NULL;

-- Verify the update
SELECT 
    region,
    COUNT(*) as deputies_count
FROM parliamentarians
WHERE camara = 'camara'
GROUP BY region
ORDER BY region;
