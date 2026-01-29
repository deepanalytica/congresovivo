import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * DELETE ALL parliamentarians and start fresh
 */
export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get count before deletion
        const { count: beforeCount } = await supabase
            .from('parliamentarians')
            .select('*', { count: 'exact', head: true });

        // DELETE ALL
        const { error: deleteError } = await supabase
            .from('parliamentarians')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (dummy condition)

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        // Verify deletion
        const { count: afterCount } = await supabase
            .from('parliamentarians')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            deleted_count: beforeCount,
            remaining_count: afterCount,
            success: afterCount === 0
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
