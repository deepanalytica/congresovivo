import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // Check for duplicates by Name (Primary cause of map duplication)
        const { data: allData, error } = await supabase.from('parliamentarians').select('id, nombre_completo, region, external_id');

        if (error) return NextResponse.json({ error: error.message });
        if (!allData) return NextResponse.json({ message: "No data" });

        const nameMap = new Map();
        const duplicates = [];

        for (const p of allData) {
            const normalizedName = p.nombre_completo.toLowerCase().trim();
            if (nameMap.has(normalizedName)) {
                duplicates.push({
                    name: p.nombre_completo,
                    original: nameMap.get(normalizedName),
                    duplicate: p
                });
            } else {
                nameMap.set(normalizedName, p);
            }
        }

        return NextResponse.json({
            total: allData.length,
            duplicatesCount: duplicates.length,
            duplicates: duplicates.slice(0, 50) // Show up to 50
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
