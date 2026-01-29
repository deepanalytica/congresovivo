import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { syncParlamentarians } from '@/lib/api/etl-pipeline';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        console.log('--- PURGING PARLIAMENTARIANS ---');
        // Delete all dependent data first
        await supabase.from('vote_roll_call').delete().not('id', 'is', null);
        await supabase.from('parliamentarians').delete().not('id', 'is', null);

        console.log('Syncing real parliamentarians...');
        const pResult = await syncParlamentarians();

        return NextResponse.json({
            success: true,
            count: pResult.count
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
