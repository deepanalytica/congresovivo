
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function diagnose() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase env vars');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Database Check ---');
    const { count: billsCount, error: bErr } = await supabase.from('bills').select('*', { count: 'exact', head: true });
    console.log(`Bills count: ${billsCount}`);
    if (bErr) console.error('Bills Error:', bErr.message);

    const { count: parlCount, error: pErr } = await supabase.from('parliamentarians').select('*', { count: 'exact', head: true });
    console.log(`Parliamentarians count: ${parlCount}`);

    const { data: latestBills } = await supabase.from('bills').select('bulletin_number, title, entry_date').order('entry_date', { ascending: false }).limit(5);
    console.log('Latest 5 bills:', JSON.stringify(latestBills, null, 2));

    console.log('\n--- Sync Status Check ---');
    const { data: syncStatus } = await supabase.from('sync_status').select('*');
    console.log('Sync status:', JSON.stringify(syncStatus, null, 2));
}

diagnose();
