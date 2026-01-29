import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get all senators
        const { data: senators, error } = await supabase
            .from('parliamentarians')
            .select('id, external_id, nombre_completo, camara, region, partido')
            .eq('camara', 'senado')
            .order('nombre_completo');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Check for duplicates by nombre_completo
        const nameMap = new Map<string, any[]>();
        senators?.forEach(s => {
            const name = s.nombre_completo.toLowerCase().trim();
            if (!nameMap.has(name)) {
                nameMap.set(name, []);
            }
            nameMap.get(name)!.push(s);
        });

        const duplicates = Array.from(nameMap.entries())
            .filter(([_, records]) => records.length > 1)
            .map(([name, records]) => ({
                nombre: name,
                count: records.length,
                records: records
            }));

        return NextResponse.json({
            total_senators: senators?.length || 0,
            unique_names: nameMap.size,
            duplicates_found: duplicates.length,
            duplicates: duplicates,
            all_senators: senators
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
