import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getVotaciones_Boletin, getVotacionDetalle } from '@/lib/api/opendata-client';

export async function GET(request: NextRequest) {
    const supabase = getServerSupabase();

    // Test with ONE session
    const sessId = "27528"; // Known from previous logs
    const roll = await getVotacionDetalle(sessId);

    const { data: parls } = await supabase.from('parliamentarians').select('id, external_id');
    const parlMap = new Map();
    parls?.forEach(p => parlMap.set(p.external_id, p.id));

    const debug = roll.slice(0, 5).map(ind => ({
        rawId: ind.parliamentarianId,
        lookup: `DIP-${ind.parliamentarianId}`,
        existsInMap: parlMap.has(`DIP-${ind.parliamentarianId}`),
        mapKeySample: Array.from(parlMap.keys()).slice(0, 3)
    }));

    return NextResponse.json(debug);
}
