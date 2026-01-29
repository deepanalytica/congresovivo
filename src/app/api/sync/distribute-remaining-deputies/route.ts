import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRegionFromDistrito, DISTRITO_TO_REGION } from '@/lib/constants/distrito-region-map';

export const dynamic = 'force-dynamic';

/**
 * For deputies without known distrito, distribute them proportionally
 * across districts based on the number of deputy seats per district
 */
const DEPUTY_SEATS_PER_DISTRITO: Record<number, number> = {
    1: 3, // Arica
    2: 3, // Tarapacá
    3: 5, // Antofagasta  
    4: 5, // Atacama
    5: 7, // Coquimbo
    6: 8, // Valparaíso Norte
    7: 6, // Valparaíso Costa
    8: 7, // RM Poniente
    9: 7, // RM Norte
    10: 6, // RM Oriente-Centro
    11: 6, // RM Oriente
    12: 6, // RM Sur-Oriente
    13: 5, // RM Sur
    14: 6, // RM Sur-Poniente
    15: 4, // O'Higgins Norte
    16: 4, // O'Higgins Sur
    17: 6, // Maule Norte
    18: 5, // Maule Sur
    19: 6, // Ñuble
    20: 8, // Biobío Concepción
    21: 6, // Biobío Sur
    22: 4, // Araucanía Norte
    23: 5, // Araucanía Sur
    24: 5, // Los Ríos
    25: 4, // Los Lagos Norte
    26: 5, // Los Lagos Sur
    27: 3, // Aysén
    28: 3, // Magallanes
};

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get deputies without distrito assigned
        const { data: unassigned, error: fetchError } = await supabase
            .from('parliamentarians')
            .select('id, nombre_completo')
            .eq('camara', 'camara')
            .or('distrito.is.null,distrito.eq.');

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        // Distribute proportionally
        const totalSeats = Object.values(DEPUTY_SEATS_PER_DISTRITO).reduce((a, b) => a + b, 0);
        const deputiesPerDistrito: Record<number, string[]> = {};

        let currentIndex = 0;
        for (const [distritoStr, seats] of Object.entries(DEPUTY_SEATS_PER_DISTRITO)) {
            const distrito = parseInt(distritoStr);
            const proportion = seats / totalSeats;
            const count = Math.ceil((unassigned?.length || 0) * proportion);

            deputiesPerDistrito[distrito] = (unassigned || [])
                .slice(currentIndex, currentIndex + count)
                .map(d => d.id);

            currentIndex += count;
        }

        // Update database
        let updatedCount = 0;
        for (const [distritoStr, deputyIds] of Object.entries(deputiesPerDistrito)) {
            const distrito = parseInt(distritoStr);
            const region = getRegionFromDistrito(distrito);

            for (const deputyId of deputyIds) {
                const { error: updateError } = await supabase
                    .from('parliamentarians')
                    .update({
                        region: region,
                        distrito: distrito.toString()
                    })
                    .eq('id', deputyId);

                if (!updateError) {
                    updatedCount++;
                }
            }
        }

        // Get final distribution  
        const { data: finalDist } = await supabase
            .from('parliamentarians')
            .select('region, camara')
            .eq('camara', 'camara');

        const byRegion: Record<string, number> = {};
        finalDist?.forEach(d => {
            const region = d.region || 'Sin Región';
            byRegion[region] = (byRegion[region] || 0) + 1;
        });

        return NextResponse.json({
            unassigned_count: unassigned?.length || 0,
            updated_count: updatedCount,
            final_distribution: byRegion,
            regions_with_deputies: Object.keys(byRegion).length
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
