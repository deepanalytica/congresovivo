import { NextRequest, NextResponse } from 'next/server';
import { fetchStats } from '@/lib/api/legislative-data';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Revalidate every 30 minutes

export async function GET(request: NextRequest) {
    try {
        const stats = await fetchStats();

        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        console.error('API /api/stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
