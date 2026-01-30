import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Get all bills with optional filters
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const chamber = searchParams.get('chamber');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        let query = supabase
            .from('bills')
            .select('*', { count: 'exact' })
            .order('fecha_ingreso', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('estado', status);
        }

        if (chamber) {
            query = query.eq('camara_origen', chamber);
        }

        const { data, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            bills: data,
            total: count,
            limit,
            offset
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
