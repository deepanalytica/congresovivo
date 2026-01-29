import { NextRequest, NextResponse } from 'next/server';
import { getDiputados } from '@/lib/api/opendata-client';

export async function GET(request: NextRequest) {
    try {
        const d = await getDiputados();
        return NextResponse.json(d.slice(0, 5));
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
