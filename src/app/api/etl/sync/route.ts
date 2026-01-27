import { NextRequest, NextResponse } from 'next/server';
import { runFullSync } from '@/lib/api/etl-pipeline';

/**
 * Manual ETL Trigger Endpoint
 * Call this endpoint to manually trigger a data sync
 * 
 * Usage: POST /api/etl/sync
 * 
 * In production, this should be:
 * 1. Protected with API key authentication
 * 2. Called by a cron job (Vercel Cron, GitHub Actions, etc.)
 */
export async function POST(request: NextRequest) {
    try {
        // TODO: Add authentication
        // const apiKey = request.headers.get('x-api-key');
        // if (apiKey !== process.env.ETL_API_KEY) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        console.log('🚀 Manual ETL sync triggered');

        const results = await runFullSync();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results,
        });

    } catch (error) {
        console.error('ETL sync error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * Get sync status
 */
export async function GET(request: NextRequest) {
    // TODO: Return last sync timestamp from database
    return NextResponse.json({
        lastSync: null,
        status: 'Not yet implemented',
        message: 'Configure Supabase to enable ETL sync',
    });
}
