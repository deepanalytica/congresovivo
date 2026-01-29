import { NextResponse } from 'next/server';
import { getDiputados } from '@/lib/api/opendata-client';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to see ALL fields returned by getDiputados API
 */
export async function GET() {
    try {
        const diputados = await getDiputados();

        // Get first 3 deputies with all their fields
        const sample = diputados.slice(0, 3);

        return NextResponse.json({
            total_deputies: diputados.length,
            sample_deputies: sample,
            fields_in_first_deputy: Object.keys(diputados[0] || {}),
            has_distrito: diputados.some(d => d.distrito && d.distrito.trim() !== ''),
            has_region: diputados.some(d => d.region && d.region.trim() !== '')
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
