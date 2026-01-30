import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Get all committees with optional filters
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const chamber = searchParams.get('chamber'); // 'camara', 'senado', 'mixta'
        const active = searchParams.get('active'); // 'true' or 'false'

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        let query = supabase
            .from('committees')
            .select(
                `
                *,
                /*
                // Temporarily disabled due to relationship error
                committee_members (
                    id,
                    role,
                    is_active,
                    parliamentarian:parliamentarians (
                        id,
                        nombre_completo,
                        partido,
                        camara,
                        region
                    )
                )
                */
                `
            )
            .order('nombre');

        if (chamber) {
            query = query.eq('camara', chamber);
        }

        if (active !== null) {
            query = query.eq('is_active', active === 'true');
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            committees: data,
            total: data?.length || 0
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
