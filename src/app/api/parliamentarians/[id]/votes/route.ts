import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/parliamentarians/[id]/votes
 * Fetches the voting record for a specific parliamentarian
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        // 1. First, find the parliamentarian UUID (in case the ID provided is an external_id)
        let parlId = id;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
            const { data: parl } = await supabase
                .from('parliamentarians')
                .select('id')
                .eq('external_id', id)
                .single();

            if (parl) parlId = parl.id;
        }

        // 2. Fetch the roll calls for this parliamentarian
        const { data, error } = await supabase
            .from('vote_roll_call')
            .select(`
                voto,
                vote:vote_id (
                    id,
                    fecha,
                    camara,
                    materia,
                    resultado,
                    boletin,
                    a_favor,
                    contra,
                    bill:bill_id (
                        titulo
                    )
                )
            `)
            .eq('parliamentarian_id', parlId)
            .order('created_at', { ascending: false }) // Use created_at or join with vote date
            .limit(limit);

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`❌ Error fetching votes for parliamentarian ${params.id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
