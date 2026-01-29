import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    const supabase = getServerSupabase();
    const { data } = await supabase.from('parliamentarians').select('id, external_id, nombre_completo');
    return NextResponse.json({
        length: data?.length,
        samples: data?.slice(0, 10),
        find1096: data?.filter(p => p.external_id?.includes('1096'))
    });
}
