import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    const supabase = getServerSupabase();
    const { data } = await supabase.from('parliamentarians').select('external_id').eq('external_id', 'DIP-1096').single();
    if (!data) return NextResponse.json({ error: "Not found" });

    return NextResponse.json({
        val: data.external_id,
        len: data.external_id.length,
        charCodes: Array.from(data.external_id).map(c => c.charCodeAt(0))
    });
}
