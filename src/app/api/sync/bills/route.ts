/**
 * API Route: Sync Bills
 * Manually trigger sync of proyectos de ley from OpenData
 */

import { NextResponse } from 'next/server';
import { syncBills } from '@/lib/api/etl-pipeline';
import { hasServerSupabase } from '@/lib/supabase/client';

export async function POST() {
    try {
        // Check if Supabase service role key is configured
        if (!hasServerSupabase()) {
            return NextResponse.json(
                {
                    error: 'SUPABASE_SERVICE_ROLE_KEY not configured',
                    message: 'Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file'
                },
                { status: 500 }
            );
        }

        console.log('🔄 Manual sync triggered: Bills');

        const result = await syncBills();

        return NextResponse.json({
            success: true,
            message: 'Bills synced successfully',
            data: result
        });

    } catch (error) {
        console.error('❌ Sync error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Sync failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to trigger bills sync',
        endpoint: '/api/sync/bills'
    });
}
