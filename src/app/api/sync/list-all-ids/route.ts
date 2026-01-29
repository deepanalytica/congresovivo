import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const { data } = await supabase.from('parliamentarians').select('nombre_completo, external_id');
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
