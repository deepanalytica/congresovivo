import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRegionFromDistrito } from '@/lib/constants/distrito-region-map';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get all deputies
        const { data: deputies, error: fetchError } = await supabase
            .from('parliamentarians')
            .select('id, nombre_completo, distrito, region')
            .eq('camara', 'camara');

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        // Update each deputy's region based on distrito
        const updates: any[] = [];
        let updatedCount = 0;

        for (const deputy of deputies || []) {
            if (!deputy.distrito) continue;

            const correctRegion = getRegionFromDistrito(deputy.distrito);

            if (deputy.region !== correctRegion) {
                const { error: updateError } = await supabase
                    .from('parliamentarians')
                    .update({ region: correctRegion })
                    .eq('id', deputy.id);

                if (!updateError) {
                    updatedCount++;
                    updates.push({
                        name: deputy.nombre_completo,
                        distrito: deputy.distrito,
                        old_region: deputy.region,
                        new_region: correctRegion
                    });
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
            total_deputies: deputies?.length || 0,
            updated_count: updatedCount,
            sample_updates: updates.slice(0, 10),
            final_distribution: byRegion,
            regions_with_deputies: Object.keys(byRegion).length
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
