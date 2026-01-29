import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import fs from 'fs';

export async function GET(request: NextRequest) {
    const logFile = 'c:\\Users\\Ale\\Desktop\\Dashboard Congreso Nacional\\sync-debug.log';
    const log = (msg: string) => { fs.appendFileSync(logFile, msg + '\n'); };

    try {
        fs.writeFileSync(logFile, '--- Detailed Map Check ---\n');
        const supabase = getServerSupabase();
        const { data: parls } = await supabase.from('parliamentarians').select('id, external_id');

        log(`Total Loaded: ${parls?.length}`);
        parls?.slice(0, 50).forEach(p => {
            log(`DB ID: ${p.id} | Ext: ${p.external_id}`);
        });

        const has1096 = parls?.some(p => p.external_id?.includes('1096'));
        log(`Found 1096? ${has1096}`);

        return NextResponse.json({ count: parls?.length, has1096 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
