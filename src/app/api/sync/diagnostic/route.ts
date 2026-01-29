import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    try {
        // 1. Check Bills Count
        const { count: billCount } = await supabase.from('bills').select('*', { count: 'exact', head: true });

        // 2. Check Unique Regions
        const { data: parlRegions } = await supabase.from('parliamentarians').select('region');

        const uniqueRegions = new Set(parlRegions?.map(p => p.region));

        return NextResponse.json({
            billCount,
            uniqueRegions: Array.from(uniqueRegions).sort()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
