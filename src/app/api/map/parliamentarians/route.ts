import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/map/parliamentarians
 * Fetches parliamentarians aggregated by region for map visualization
 */
export async function GET(request: NextRequest) {
    try {
        // Fetch all parliamentarians with their location info
        const { data: parliamentarians, error } = await supabase
            .from('parliamentarians')
            .select('id, nombre_completo, camara, partido, region, distrito, circunscripcion, ideologia');

        if (error) throw error;

        // Approximate coordinates for Chile's regions (Center points)
        const regionCoordinates: Record<string, { lat: number; lng: number }> = {
            'Arica y Parinacota': { lat: -18.4783, lng: -70.3126 },
            'Tarapacá': { lat: -20.2307, lng: -70.1357 },
            'Antofagasta': { lat: -23.6509, lng: -70.3975 },
            'Atacama': { lat: -27.3668, lng: -70.3314 },
            'Coquimbo': { lat: -29.9533, lng: -71.2520 },
            'Valparaíso': { lat: -33.0472, lng: -71.6127 },
            'Metropolitana': { lat: -33.4489, lng: -70.6693 },
            "O'Higgins": { lat: -34.1708, lng: -70.7444 },
            'Maule': { lat: -35.4264, lng: -71.6554 },
            'Ñuble': { lat: -36.6063, lng: -72.1034 },
            'Biobío': { lat: -36.8201, lng: -73.0444 },
            'Araucanía': { lat: -38.7359, lng: -72.5904 },
            'Los Ríos': { lat: -39.8191, lng: -73.2452 },
            'Los Lagos': { lat: -41.4689, lng: -72.9411 },
            'Aysén': { lat: -45.5712, lng: -72.0683 },
            'Magallanes': { lat: -53.1638, lng: -70.9171 }
        };

        // Group by region
        const aggregated = parliamentarians.reduce((acc: any, p) => {
            const region = p.region || 'Desconocida';
            if (!acc[region]) {
                acc[region] = {
                    region,
                    count: 0,
                    senators: 0,
                    deputies: 0,
                    parliamentarians: [],
                    coords: regionCoordinates[region] || { lat: -33.45, lng: -70.66 } // Default to Santiago
                };
            }

            acc[region].count++;
            if (p.camara === 'senado') acc[region].senators++;
            else acc[region].deputies++;

            acc[region].parliamentarians.push(p);
            return acc;
        }, {});

        return NextResponse.json(Object.values(aggregated));
    } catch (error: any) {
        console.error('❌ Error fetching map data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
