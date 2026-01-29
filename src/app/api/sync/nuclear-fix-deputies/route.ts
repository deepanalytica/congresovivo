import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRegionFromDistrito } from '@/lib/constants/distrito-region-map';

export const dynamic = 'force-dynamic';

/**
 * NUCLEAR OPTION: Update ALL deputies' regions based on their distrito
 * Ignores current region value completely
 */
export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get ALL deputies
        const { data: allDeputies, error: fetchError } = await supabase
            .from('parliamentarians')
            .select('id, nombre_completo, region, distrito')
            .eq('camara', 'camara')
            .order('nombre_completo');

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        let updatedCount = 0;
        const updates: { name: string; oldRegion: string; newRegion: string; distrito: string }[] = [];

        // Update EVERY deputy based on distrito
        for (const deputy of allDeputies || []) {
            if (!deputy.distrito || deputy.distrito.trim() === '') {
                continue; // Skip deputies without distrito
            }

            const distritoNum = parseInt(deputy.distrito);
            const correctRegion = getRegionFromDistrito(distritoNum);

            // FORCE update regardless of current value
            const { error: updateError } = await supabase
                .from('parliamentarians')
                .update({ region: correctRegion })
                .eq('id', deputy.id);

            if (!updateError) {
                updatedCount++;
                updates.push({
                    name: deputy.nombre_completo,
                    oldRegion: deputy.region || 'NULL',
                    newRegion: correctRegion,
                    distrito: deputy.distrito
                });
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
            total_deputies: allDeputies?.length || 0,
            updated_count: updatedCount,
            sample_updates: updates.slice(0, 10),
            final_distribution: byRegion,
            regions_count: Object.keys(byRegion).length
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
