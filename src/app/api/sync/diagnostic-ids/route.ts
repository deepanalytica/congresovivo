import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { getVotacionDetalle } from '@/lib/api/opendata-client';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // Sample roll call from a known session
        const sessionId = "27528";
        const rollCall = await getVotacionDetalle(sessionId);

        const { data: parls } = await supabase.from('parliamentarians').select('id, external_id');
        const keys = parls?.map(p => p.external_id) || [];

        const diagnostics = {
            sampleRollCallIds: rollCall.slice(0, 5).map(r => r.parliamentarianId),
            sampleDbIds: keys.slice(0, 10),
            matchesFound: 0,
            failedAttempts: [] as string[]
        };

        rollCall.slice(0, 10).forEach(r => {
            const id = r.parliamentarianId;
            const lookup1 = `DIP-${id}`;
            const lookup2 = id;
            if (keys.includes(lookup1) || keys.includes(lookup2)) {
                diagnostics.matchesFound++;
            } else {
                diagnostics.failedAttempts.push(lookup1);
            }
        });

        return NextResponse.json(diagnostics);
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
