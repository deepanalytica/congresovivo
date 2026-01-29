import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { syncParlamentarians, syncBills } from '@/lib/api/etl-pipeline';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        console.log('--- RESETTING DATABASE ---');
        // Delete all dependent data
        await supabase.from('vote_roll_call').delete().not('id', 'is', null);
        await supabase.from('votes').delete().not('id', 'is', null);
        await supabase.from('parliamentarians').delete().not('id', 'is', null);
        await supabase.from('bills').delete().not('id', 'is', null);

        console.log('Syncing real parliamentarians...');
        const pResult = await syncParlamentarians();

        console.log('Syncing real bills...');
        const bResult = await syncBills();

        return NextResponse.json({
            success: true,
            parliamentarians: pResult.count,
            bills: bResult.count
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
