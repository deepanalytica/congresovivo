import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;

  return NextResponse.json({
    hasServiceKey,
    keyLength
  });
}
