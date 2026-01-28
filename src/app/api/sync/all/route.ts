/**
 * API Route: Full Sync
 * Manually trigger complete sync of all data (parliamentarians + bills)
 */

import { NextResponse } from 'next/server';
import { runFullSync } from '@/lib/api/etl-pipeline';
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

        console.log('🚀 Manual sync triggered: Full sync (parliamentarians + bills)');

        const result = await runFullSync();

        return NextResponse.json({
            success: result.errors.length === 0,
            message: result.errors.length === 0
                ? 'Full sync completed successfully'
                : 'Sync completed with some errors',
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
        message: 'Use POST to trigger full sync (parliamentarians + bills)',
        endpoint: '/api/sync/all',
        available_endpoints: {
            parliamentarians: '/api/sync/parliamentarians',
            bills: '/api/sync/bills',
            all: '/api/sync/all'
        }
    });
}
