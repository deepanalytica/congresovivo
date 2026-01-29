import { NextRequest, NextResponse } from 'next/server';
import { getProyectosLey } from '@/lib/api/opendata-client';

export async function GET(request: NextRequest) {
    try {
        const data = await getProyectosLey();
        return NextResponse.json({ length: data.length, sample: data[0] });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
