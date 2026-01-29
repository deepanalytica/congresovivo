import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get deputies distribution by region
        const { data: deputies, error } = await supabase
            .from('parliamentarians')
            .select('id, nombre_completo, region, partido, distrito')
            .eq('camara', 'camara')
            .order('region');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Group by region
        const byRegion: Record<string, number> = {};
        deputies?.forEach(d => {
            const region = d.region || 'Sin Región';
            byRegion[region] = (byRegion[region] || 0) + 1;
        });

        return NextResponse.json({
            total_deputies: deputies?.length || 0,
            by_region: byRegion,
            regions_count: Object.keys(byRegion).length,
            sample_deputies: deputies?.slice(0, 10)
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
