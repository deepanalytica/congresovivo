import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // Get all senators
        const { data: senators, error } = await supabase
            .from('parliamentarians')
            .select('*')
            .eq('camara', 'senado')
            .order('nombre_completo');

        if (error) return NextResponse.json({ error: error.message });
        if (!senators) return NextResponse.json({ message: "No senators found" });

        // Check for duplicates by nombre_completo
        const nameMap = new Map();
        const duplicatesByName = [];

        for (const s of senators) {
            const name = s.nombre_completo.toLowerCase().trim();
            if (nameMap.has(name)) {
                duplicatesByName.push({
                    name: s.nombre_completo,
                    ids: [nameMap.get(name).id, s.id],
                    external_ids: [nameMap.get(name).external_id, s.external_id],
                    regions: [nameMap.get(name).region, s.region]
                });
            } else {
                nameMap.set(name, s);
            }
        }

        // Check for duplicates by external_id
        const externalIdMap = new Map();
        const duplicatesByExternalId = [];

        for (const s of senators) {
            if (externalIdMap.has(s.external_id)) {
                duplicatesByExternalId.push({
                    external_id: s.external_id,
                    ids: [externalIdMap.get(s.external_id).id, s.id],
                    names: [externalIdMap.get(s.external_id).nombre_completo, s.nombre_completo]
                });
            } else {
                externalIdMap.set(s.external_id, s);
            }
        }

        return NextResponse.json({
            total_senators: senators.length,
            unique_names: nameMap.size,
            duplicates_by_name: {
                count: duplicatesByName.length,
                items: duplicatesByName
            },
            duplicates_by_external_id: {
                count: duplicatesByExternalId.length,
                items: duplicatesByExternalId
            },
            all_senators: senators.map(s => ({
                id: s.id,
                external_id: s.external_id,
                nombre_completo: s.nombre_completo,
                region: s.region,
                partido: s.partido
            }))
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
