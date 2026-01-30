import { NextResponse } from 'next/server';
import { syncBills } from '@/lib/api/etl-pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

/**
 * Sync bills from OpenData API
 * Supports batch processing for a specific year
 */
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const currentYear = body.year || new Date().getFullYear();

        console.log(`🚀 Manual sync triggered: Bills only (Year: ${currentYear})`);
        const result = await syncBills(currentYear);

        return NextResponse.json(result);

    } catch (e: any) {
        console.error('❌ Bills Sync Error:', e);
        return NextResponse.json({
            success: false,
            error: e.message
        }, { status: 500 });
    }
}

/**
 * Get sync status for bills (Simple Placeholder)
 */
export async function GET() {
    return NextResponse.json({
        message: 'Use POST to trigger bills sync',
        endpoint: '/api/sync/bills'
    });
}
