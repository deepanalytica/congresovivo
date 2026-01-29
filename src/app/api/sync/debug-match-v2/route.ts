import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getVotacionDetalle } from '@/lib/api/opendata-client';

export async function GET(request: NextRequest) {
    const supabase = getServerSupabase();
    const sessId = "27528";
    const roll = await getVotacionDetalle(sessId);

    const { data: parls } = await supabase.from('parliamentarians').select('id, external_id');
    const parlMap = new Map();
    parls?.forEach(p => {
        if (p.external_id) parlMap.set(p.external_id.trim().toUpperCase(), p.id);
    });

    const firstRoll = roll[0];
    const lookup = `DIP-${firstRoll.parliamentarianId}`.toUpperCase();

    return NextResponse.json({
        totalParlsInMap: parlMap.size,
        firstRollFromApi: firstRoll,
        constructedLookup: lookup,
        matchFound: parlMap.has(lookup),
        allMapKeysSample: Array.from(parlMap.keys()).slice(0, 100)
    });
}
