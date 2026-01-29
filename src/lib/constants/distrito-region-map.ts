/**
 * Complete Map of Chilean Electoral Districts (2017-present) to Regions
 * Based on Law N°20.840 (2015 Electoral Reform)
 * Source: Biblioteca del Congreso Nacional (BCN) and SERVEL
 * 
 * Chile has 28 electoral districts electing 155 deputies total
 */
export const DISTRITO_TO_REGION: Record<number, string> = {
    // Distrito 1: Región de Arica y Parinacota (3 deputies)
    1: 'Arica y Parinacota',

    // Distrito 2: Región de Tarapacá (3 deputies)
    2: 'Tarapacá',

    // Distrito 3: Región de Antofagasta (5 deputies)
    3: 'Antofagasta',

    // Distrito 4: Región de Atacama (5 deputies)
    4: 'Atacama',

    // Distrito 5: Región de Coquimbo (7 deputies)
    5: 'Coquimbo',

    // Distrito 6: Región de Valparaíso - Norte (8 deputies)
    6: 'Valparaíso',

    // Distrito 7: Región de Valparaíso - Costa (6 deputies)
    7: 'Valparaíso',

    // Distrito 8: Región Metropolitana - Poniente (7 deputies)
    // Colina, Lampa, Quilicura, Pudahuel, Tiltil, Cerrillos, Estación Central, Maipú
    8: 'Metropolitana',

    // Distrito 9: Región Metropolitana - Norte (7 deputies)
    // Cerro Navia, Conchalí, Huechuraba, Independencia, Lo Prado, Quinta Normal, Recoleta, Renca
    9: 'Metropolitana',

    // Distrito 10: Región Metropolitana - Oriente-Centro (6 deputies)
    // La Granja, Macul, Ñuñoa, Providencia, San Joaquín, Santiago
    10: 'Metropolitana',

    // Distrito 11: Región Metropolitana - Oriente (6 deputies)
    // Las Condes, Vitacura, Lo Barnechea, La Reina, Peñalolén
    11: 'Metropolitana',

    // Distrito 12: Región Metropolitana - Sur-Oriente (6 deputies)
    // La Florida, La Pintana, Pirque, Puente Alto, San José de Maipo
    12: 'Metropolitana',

    // Distrito 13: Región Metropolitana - Sur (5 deputies)
    // El Bosque, La Cisterna, Lo Espejo, Pedro Aguirre Cerda, San Miguel, San Ramón
    13: 'Metropolitana',

    // Distrito 14: Región Metropolitana - Sur-Poniente (6 deputies)
    // Alhué, Buin, Calera de Tango, Curacaví, El Monte, Isla de Maipo, María Pinto, 
    // Melipilla, Padre Hurtado, Paine, Peñaflor, San Bernardo, San Pedro, Talagante
    14: 'Metropolitana',

    // Distrito 15: Región de O'Higgins - Norte (4 deputies)
    15: "O'Higgins",

    // Distrito 16: Región de O'Higgins - Sur (4 deputies)
    16: "O'Higgins",

    // Distrito 17: Región del Maule - Norte (6 deputies)
    17: 'Maule',

    // Distrito 18: Región del Maule - Sur (5 deputies)
    18: 'Maule',

    // Distrito 19: Región de Ñuble (6 deputies)
    19: 'Ñuble',

    // Distrito 20: Región del Biobío - Concepción (8 deputies)
    20: 'Biobío',

    // Distrito 21: Región del Biobío - Sur (6 deputies)
    21: 'Biobío',

    // Distrito 22: Región de La Araucanía - Norte (4 deputies)
    22: 'Araucanía',

    // Distrito 23: Región de La Araucanía - Sur (5 deputies)
    23: 'Araucanía',

    // Distrito 24: Región de Los Ríos (5 deputies)
    24: 'Los Ríos',

    // Distrito 25: Región de Los Lagos - Norte (4 deputies)
    25: 'Los Lagos',

    // Distrito 26: Región de Los Lagos - Sur (5 deputies)
    26: 'Los Lagos',

    // Distrito 27: Región de Aysén (3 deputies)
    27: 'Aysén',

    // Distrito 28: Región de Magallanes (3 deputies)
    28: 'Magallanes'
};

/**
 * Get region name from distrito number
 */
export function getRegionFromDistrito(distrito: number | string | null): string {
    if (!distrito) return 'Metropolitana'; // Default fallback

    const distritoNum = typeof distrito === 'string' ? parseInt(distrito, 10) : distrito;

    if (isNaN(distritoNum) || distritoNum < 1 || distritoNum > 28) {
        return 'Metropolitana'; // Default for invalid districts
    }

    return DISTRITO_TO_REGION[distritoNum] || 'Metropolitana';
}

/**
 * Normalize region names to match the map's expected format
 */
export function normalizeRegionName(region: string): string {
    if (!region) return 'Metropolitana';

    // Remove common prefixes
    let normalized = region
        .replace(/^Región\s+(de\s+|del\s+|de\s+la\s+|de\s+los\s+)?/i, '')
        .trim();

    // Specific normalizations
    if (normalized.includes("Libertador") || normalized.includes("O'Higgins")) {
        return "O'Higgins";
    }
    if (normalized.includes("Magallanes")) {
        return "Magallanes";
    }
    if (normalized.includes("Aysén") || normalized.includes("Ibáñez")) {
        return "Aysén";
    }
    if (normalized.includes("Metropolitana") || normalized === "Santiago") {
        return "Metropolitana";
    }

    return normalized;
}
