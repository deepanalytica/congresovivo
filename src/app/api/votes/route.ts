import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/votes
 * Fetches voting records from Supabase
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const camara = searchParams.get('camara'); // 'camara' or 'senado'
        const resultado = searchParams.get('resultado'); // 'aprobado' or 'rechazado'
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
            .from('votes')
            .select(`
                *,
                bill:bill_id (
                    titulo,
                    boletin
                )
            `)
            .order('fecha', { ascending: false })
            .limit(limit);

        if (camara) {
            query = query.eq('camara', camara);
        }

        if (resultado) {
            query = query.eq('resultado', resultado);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('❌ Error fetching votes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
