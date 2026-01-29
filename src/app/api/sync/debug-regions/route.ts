import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // Fetch all distinct regions directly from DB
        const { data, error } = await supabase
            .from('parliamentarians')
            .select('region')
            .not('region', 'is', null);

        if (error) return NextResponse.json({ error: error.message });

        // Aggregate in JS to see exact strings including whitespace
        const counts: Record<string, number> = {};
        data?.forEach(r => {
            const raw = r.region; // Keep exact string
            counts[raw] = (counts[raw] || 0) + 1;
        });

        return NextResponse.json({
            total_rows: data?.length,
            distinct_regions: Object.keys(counts).length,
            regions: counts
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
