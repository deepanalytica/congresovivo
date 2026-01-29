import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Normalize ALL region names to ensure consistent naming
 * between senators and deputies
 */
export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get all parliamentarians
        const { data: all, error: fetchError } = await supabase
            .from('parliamentarians')
            .select('id, nombre_completo, region, camara');

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        let updatedCount = 0;

        for (const p of all || []) {
            if (!p.region) continue;

            let normalizedRegion = p.region;

            // Metropolitana variations
            if (p.region.includes('Metropolitana') || p.region.includes('Santiago')) {
                normalizedRegion = 'Metropolitana';
            }
            // Araucanía
            else if (p.region.includes('Araucan')) {
                normalizedRegion = 'Araucanía';
            }
            // O'Higgins
            else if (p.region.includes('Higgins') || p.region.includes('Libertador')) {
                normalizedRegion = "O'Higgins";
            }
            // Magallanes
            else if (p.region.includes('Magallanes') || p.region.includes('Antártica')) {
                normalizedRegion = 'Magallanes';
            }
            // Aysén
            else if (p.region.includes('Aysén') || p.region.includes('Ibáñez')) {
                normalizedRegion = 'Aysén';
            }
            // Los Lagos (must include "Los")
            else if (p.region.includes('Lagos')) {
                normalizedRegion = 'Los Lagos';
            }
            // Los Ríos (must include "Los")
            else if (p.region.includes('Río') || p.region.includes('Ríos')) {
                normalizedRegion = 'Los Ríos';
            }
            // Ñuble
            else if (p.region.includes('uble')) {
                normalizedRegion = 'Ñuble';
            }
            // Remove "Región de/del/de la/de los" prefixes for others
            else {
                normalizedRegion = p.region
                    .replace(/^Región\s+(de\s+la\s+|de\s+los\s+|del\s+|de\s+)/gi, '')
                    .trim();
            }

            if (normalizedRegion !== p.region) {
                const { error: updateError } = await supabase
                    .from('parliamentarians')
                    .update({ region: normalizedRegion })
                    .eq('id', p.id);

                if (!updateError) {
                    updatedCount++;
                }
            }
        }

        // Get final distribution
        const { data: finalDist } = await supabase
            .from('parliamentarians')
            .select('region, camara');

        const byRegion: Record<string, { senators: number; deputies: number; total: number }> = {};
        finalDist?.forEach(p => {
            const region = p.region || 'Sin Región';
            if (!byRegion[region]) {
                byRegion[region] = { senators: 0, deputies: 0, total: 0 };
            }
            byRegion[region].total++;
            if (p.camara === 'senado') {
                byRegion[region].senators++;
            } else {
                byRegion[region].deputies++;
            }
        });

        return NextResponse.json({
            total_parliamentarians: all?.length || 0,
            updated_count: updatedCount,
            unique_regions: Object.keys(byRegion).length,
            distribution: byRegion
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
