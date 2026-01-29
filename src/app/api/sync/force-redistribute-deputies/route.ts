import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRegionFromDistrito, DISTRITO_TO_REGION } from '@/lib/constants/distrito-region-map';

export const dynamic = 'force-dynamic';

/**
 * FORCE redistribution of ALL deputies across regions
 * This overrides the current region assignment
 */
export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get ALL deputies regardless of current region
        const { data: allDeputies, error: fetchError } = await supabase
            .from('parliamentarians')
            .select('id, nombre_completo, region, distrito')
            .eq('camara', 'camara')
            .order('nombre_completo');

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        // Separate deputies with and without distrito
        const withDistrito = (allDeputies || []).filter(d => d.distrito && d.distrito.trim() !== '');
        const withoutDistrito = (allDeputies || []).filter(d => !d.distrito || d.distrito.trim() === '');

        let updatedCount = 0;

        // Update deputies that have distrito
        for (const deputy of withDistrito) {
            const correctRegion = getRegionFromDistrito(parseInt(deputy.distrito));

            if (deputy.region !== correctRegion) {
                const { error: updateError } = await supabase
                    .from('parliamentarians')
                    .update({ region: correctRegion })
                    .eq('id', deputy.id);

                if (!updateError) {
                    updatedCount++;
                }
            }
        }

        // For deputies without distrito, distribute proportionally
        const DEPUTY_SEATS_PER_DISTRITO: Record<number, number> = {
            1: 3, 2: 3, 3: 5, 4: 5, 5: 7, 6: 8, 7: 6,
            8: 7, 9: 7, 10: 6, 11: 6, 12: 6, 13: 5, 14: 6,
            15: 4, 16: 4, 17: 6, 18: 5, 19: 6, 20: 8, 21: 6,
            22: 4, 23: 5, 24: 5, 25: 4, 26: 5, 27: 3, 28: 3
        };

        const totalSeats = Object.values(DEPUTY_SEATS_PER_DISTRITO).reduce((a, b) => a + b, 0);
        let currentIndex = 0;

        for (const [distritoStr, seats] of Object.entries(DEPUTY_SEATS_PER_DISTRITO)) {
            const distrito = parseInt(distritoStr);
            const region = getRegionFromDistrito(distrito);
            const proportion = seats / totalSeats;
            const count = Math.ceil(withoutDistrito.length * proportion);

            const deputiesToAssign = withoutDistrito.slice(currentIndex, currentIndex + count);

            for (const deputy of deputiesToAssign) {
                const { error: updateError } = await supabase
                    .from('parliamentarians')
                    .update({
                        region: region,
                        distrito: distrito.toString()
                    })
                    .eq('id', deputy.id);

                if (!updateError) {
                    updatedCount++;
                }
            }

            currentIndex += count;
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
            total_deputies: allDeputies?.length || 0,
            with_distrito: withDistrito.length,
            without_distrito: withoutDistrito.length,
            updated_count: updatedCount,
            final_distribution: byRegion,
            regions_with_deputies: Object.keys(byRegion).length
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
