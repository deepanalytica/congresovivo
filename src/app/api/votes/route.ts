import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/votes
 * Fetches voting records from Supabase
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const camara = searchParams.get('camara');
        const resultado = searchParams.get('resultado');
        const includeRollCall = searchParams.get('roll_call') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');

        let selectString = `
            *,
            bill:bill_id (
                titulo,
                boletin
            )
        `;

        if (includeRollCall) {
            selectString += `,
                roll_call:vote_roll_call (
                    voto,
                    parliamentarian:parliamentarian_id (
                        id,
                        nombre_completo,
                        partido,
                        camara,
                        region
                    )
                )
            `;
        }

        if (id) {
            const { data, error } = await supabase
                .from('votes')
                .select(selectString)
                .eq('id', id)
                .single();
            if (error) throw error;
            return NextResponse.json(data);
        } else {
            let query = supabase
                .from('votes')
                .select(selectString)
                .order('fecha', { ascending: false })
                .limit(limit);

            if (camara) query = query.eq('camara', camara);
            if (resultado) query = query.eq('resultado', resultado);

            const { data, error } = await query;
            if (error) throw error;
            return NextResponse.json(data);
        }
    } catch (error: any) {
        console.error('❌ Error fetching votes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
