import { NextRequest, NextResponse } from 'next/server';
import { fetchBills } from '@/lib/api/legislative-data';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Revalidate every 30 minutes

export async function GET(request: NextRequest) {
    try {
        const bills = await fetchBills();

        // Sort by most recent activity
        const sortedBills = [...bills].sort((a, b) =>
            b.fechaUltimaModificacion.getTime() - a.fechaUltimaModificacion.getTime()
        );

        return NextResponse.json(sortedBills, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        console.error('API /api/bills error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bills' },
            { status: 500 }
        );
    }
}
