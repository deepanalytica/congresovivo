import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Find all duplicates
        const { data: duplicates, error: findError } = await supabase
            .from('parliamentarians')
            .select('nombre_completo, id, created_at, external_id')
            .eq('camara', 'senado')
            .order('nombre_completo')
            .order('created_at', { ascending: false });

        if (findError) {
            return NextResponse.json({ error: findError.message }, { status: 500 });
        }

        // Group by name and identify duplicates
        const nameMap = new Map<string, any[]>();
        duplicates?.forEach(senator => {
            const name = senator.nombre_completo;
            if (!nameMap.has(name)) {
                nameMap.set(name, []);
            }
            nameMap.get(name)!.push(senator);
        });

        const duplicateGroups = Array.from(nameMap.entries())
            .filter(([_, records]) => records.length > 1);

        // 2. Delete older duplicates (keep the first one which is the most recent)
        const idsToDelete: string[] = [];
        duplicateGroups.forEach(([name, records]) => {
            // Keep first (most recent), delete the rest
            records.slice(1).forEach(record => {
                idsToDelete.push(record.id);
            });
        });

        let deleteResult = null;
        if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('parliamentarians')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) {
                return NextResponse.json({ error: deleteError.message }, { status: 500 });
            }

            deleteResult = {
                deleted_count: idsToDelete.length,
                deleted_ids: idsToDelete
            };
        }

        // 3. Get final count
        const { count: finalCount } = await supabase
            .from('parliamentarians')
            .select('*', { count: 'exact', head: true })
            .eq('camara', 'senado');

        return NextResponse.json({
            duplicates_found: duplicateGroups.length,
            duplicate_groups: duplicateGroups.map(([name, records]) => ({
                name,
                count: records.length
            })),
            cleanup: deleteResult,
            final_senator_count: finalCount
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
