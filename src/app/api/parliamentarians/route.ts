import { NextRequest, NextResponse } from 'next/server';
import { fetchParlamentarios } from '@/lib/api/legislative-data';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Revalidate every 30 minutes

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const camara = searchParams.get('camara');

        let parlamentarios = await fetchParlamentarios();

        // Filter by chamber if specified
        if (camara && (camara === 'senado' || camara === 'camara')) {
            parlamentarios = parlamentarios.filter(p => p.camara === camara);
        }

        return NextResponse.json(parlamentarios, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        console.error('API /api/parliamentarians error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch parliamentarians' },
            { status: 500 }
        );
    }
}
