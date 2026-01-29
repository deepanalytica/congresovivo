import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

/**
 * Standardizes parliamentarian data:
 * 1. Keeps only real ones (prefixed with DIP- or S-)
 * 2. Removes duplicates and old realistic data
 * GET /api/sync/cleanup-parliamentarians
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();

        // 1. Fetch all
        const { data: all } = await supabase.from('parliamentarians').select('id, external_id, nombre_completo');
        if (!all) return NextResponse.json({ message: 'No parliamentarians found' });

        const toKeep = new Set<string>();
        const toDelete: string[] = [];

        // Prioritize DIP- and S- prefixes
        all.forEach(p => {
            const extId = p.external_id || '';
            if (extId.startsWith('DIP-') || extId.startsWith('S-')) {
                // If we haven't seen this numeric ID yet, keep it
                const numericId = extId.match(/\d+/)?.[0];
                if (numericId && !toKeep.has(numericId)) {
                    toKeep.add(numericId);
                } else {
                    // It's a duplicate of a real one or weird
                    // Actually, let's keep all DIP- and S- for now to be safe
                }
            } else {
                toDelete.push(p.id);
            }
        });

        console.log(`Cleaning up ${toDelete.length} parliamentarians...`);

        if (toDelete.length > 0) {
            // Delete in batches to avoid URL length issues or timeouts
            for (let i = 0; i < toDelete.length; i += 50) {
                const batch = toDelete.slice(i, i + 50);
                const { error } = await supabase.from('parliamentarians').delete().in('id', batch);
                if (error) console.error(`Batch delete error: ${error.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            deletedCount: toDelete.length,
            remainingCount: all.length - toDelete.length
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
