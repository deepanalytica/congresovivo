import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get all senators
        const { data: senators, error } = await supabase
            .from('parliamentarians')
            .select('id, external_id, nombre_completo, region, partido')
            .eq('camara', 'senado')
            .order('nombre_completo');

        if (error) {
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        // Find duplicates by name
        const nameCount: Record<string, any[]> = {};
        senators?.forEach(s => {
            const name = s.nombre_completo;
            if (!nameCount[name]) {
                nameCount[name] = [];
            }
            nameCount[name].push(s);
        });

        const duplicates = Object.entries(nameCount)
            .filter(([_, records]) => records.length > 1)
            .map(([name, records]) => ({ name, count: records.length, records }));

        return NextResponse.json({
            total: senators?.length || 0,
            duplicates_count: duplicates.length,
            duplicates: duplicates,
            all_senators: senators
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
