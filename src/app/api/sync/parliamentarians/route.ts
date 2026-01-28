/**
 * API Route: Sync Parliamentarians
 * Manually trigger sync of diputados and senadores from OpenData
 */

import { NextResponse } from 'next/server';
import { syncParlamentarians } from '@/lib/api/etl-pipeline';
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

        console.log('🔄 Manual sync triggered: Parliamentarians');

        const result = await syncParlamentarians();

        return NextResponse.json({
            success: true,
            message: 'Parliamentarians synced successfully',
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
        message: 'Use POST to trigger parliamentarians sync',
        endpoint: '/api/sync/parliamentarians'
    });
}
