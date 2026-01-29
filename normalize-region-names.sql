-- Normalize all region names in the parliamentarians table
-- This ensures senators and deputies use the same region names

UPDATE parliamentarians
SET region = CASE 
    -- Metropolitana variations
    WHEN region LIKE '%Metropolitana%' OR region LIKE '%Santiago%' THEN 'Metropolitana'
    
    -- Araucanía
    WHEN region LIKE '%Araucan%' THEN 'Araucanía'
   
    -- O'Higgins
    WHEN region LIKE '%Higgins%' OR region LIKE '%Libertador%' THEN 'O''Higgins'
    
    -- Magallanes
    WHEN region LIKE '%Magallanes%' OR region LIKE '%Ant%rtica%' THEN 'Magallanes'
    
    -- Aysén
    WHEN region LIKE '%Ays%n%' OR region LIKE '%Ib%ez%' THEN 'Aysén'
    
    -- Remove "Región de/del/de la/de los" prefixes from others
    WHEN region LIKE 'Región de %' THEN REPLACE(REPLACE(REPLACE(REPLACE(region, 'Región de la ', ''), 'Región de los ', ''), 'Región del ', ''), 'Región de ', '')
    WHEN region LIKE 'Región del %' THEN REPLACE(region, 'Región del ', '')
    
    ELSE region
END
WHERE region IS NOT NULL;

-- Verify the normalization
SELECT 
    region,
    camara,
    COUNT(*) as count
FROM parliamentarians
GROUP BY region, camara
ORDER BY region, camara;
