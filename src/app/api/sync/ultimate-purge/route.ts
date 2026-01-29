import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const { data: parls } = await supabase.from('parliamentarians').select('id');

        let deleted = 0;
        for (const p of parls || []) {
            const { error } = await supabase.from('parliamentarians').delete().eq('id', p.id);
            if (!error) deleted++;
        }

        return NextResponse.json({ success: true, deleted });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
