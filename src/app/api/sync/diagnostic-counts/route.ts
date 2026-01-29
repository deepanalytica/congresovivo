import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        const { count: billsCount, data: bills } = await supabase.from('bills').select('boletin', { count: 'exact' });
        const { count: votesCount, error: votesError } = await supabase.from('votes').select('*', { count: 'exact', head: true });
        const { count: deputiesCount } = await supabase.from('parliamentarians').select('*', { count: 'exact', head: true }).eq('camara', 'camara');
        const { count: senatorsCount } = await supabase.from('parliamentarians').select('*', { count: 'exact', head: true }).eq('camara', 'senado');

        return NextResponse.json({
            bills: billsCount,
            billsList: bills?.map(b => b.boletin),
            votes: votesCount,
            votesError: votesError ? votesError.message : null,
            deputies: deputiesCount,
            senators: senatorsCount
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
