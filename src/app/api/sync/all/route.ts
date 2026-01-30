/**
 * API Route: Full Sync
 * Manually trigger complete sync of all data (parliamentarians + bills)
 */

import { NextResponse } from 'next/server';
import { runFullSync, syncBills } from '@/lib/api/etl-pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

/**
 * API Route: Full Sync
 * Manually trigger complete sync of all data
 */
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { year = new Date().getFullYear() } = body;

        console.log(`🚀 Manual sync triggered: Direct ETL Orquestration (Year: ${year})`);

        // Execute full sync (includes parliamentarians and bills for the target year)
        const result = await runFullSync(year);

        // If we want a deep history, we also sync 2024 specifically if we are in 2025
        if (year === 2025) {
            console.log('🔄 Supplementary sync for 2024...');
            await syncBills(2024).catch(() => console.log('2024 supplementary sync skipped'));
        }

        if (!result.success) {
            throw new Error(result.error || 'ETL Sync failed');
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('❌ Sync error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to trigger full sync',
        endpoint: '/api/sync/all'
    });
}
