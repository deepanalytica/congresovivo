import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return NextResponse.json({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        mock: process.env.NEXT_PUBLIC_ENABLE_REAL_DATA
    });
}
