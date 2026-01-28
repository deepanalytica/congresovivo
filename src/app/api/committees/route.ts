import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/committees
 * Fetches committee records from Supabase with member counts
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const camara = searchParams.get('camara'); // 'camara', 'senado', 'mixta'
        const tipo = searchParams.get('tipo'); // 'permanente', 'especial'

        let query = supabase
            .from('committees')
            .select(`
                *,
                members:committee_members (
                    count
                )
            `)
            .order('nombre', { ascending: true });

        if (camara && camara !== 'all') {
            query = query.eq('camara', camara);
        }

        if (tipo && tipo !== 'all') {
            query = query.eq('tipo', tipo);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Map data to include member count properly
        const committees = data.map(c => ({
            ...c,
            memberCount: c.members[0]?.count || 0,
            members: undefined // Remove the specific members count object from response
        }));

        return NextResponse.json(committees);
    } catch (error: any) {
        console.error('❌ Error fetching committees:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
